import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject, OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PalladiumApiService, StructuredPlans } from '../../services/palladium-api.service';
import { StanceService } from '../../services/stance.service';
import { Router } from '@angular/router';
import { ProductSettingsComponent } from '../products/products.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Plan } from "../models/plan";
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { Product } from '../models/product';
import { SidenavService } from 'services/sidenav.service';
import { validateNameExists } from 'app/validates_and_matchers/name-exist.validate';
import { InstantErrorStateMatcher } from 'app/validates_and_matchers/instant-error-state.matcher';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansComponent implements OnInit, OnDestroy {
  plans$: ReplaySubject<Plan[]> = new ReplaySubject(1);
  zoroCaseCount$ = new BehaviorSubject(0);

  activeRoute$: Observable<{}>;
  private unsubscribe: Subject<void> = new Subject();

  selectedPlanId = 0;
  planForSettings: Plan;
  RUN_COMPONENT;
  loading = false;
  showMore = true;
  no_plan_found_warning: boolean;
  currentProduct$: Observable<Product>;
  filteredPlans$: Observable<Plan[]>;

  constructor(public palladiumApiService: PalladiumApiService,
    public stance: StanceService,
    public sidenavService: SidenavService,
    private activatedRoute: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private cd: ChangeDetectorRef) {
      this.filteredPlans$ = this.plans$;
    }

  ngOnInit() {
    this.activeRoute$ = this.activatedRoute.params.pipe(pluck('id'), map(id => {
      this.set_current_product_name(+id)
      this.init_plans(id);
      return +id;
    }));

    this.palladiumApiService.plans$.pipe(takeUntil(this.unsubscribe)).subscribe((plans) => {
      this.no_plan_found_warning = Object(plans).keys?.length == 0;
      this.loading = false;
    })

    this.activeRoute$.pipe(switchMap((id: number) => {
      return this.palladiumApiService.plans$.pipe(map((plans: StructuredPlans) => this.plans$.next(plans[id])));
    }), takeUntil(this.unsubscribe)).subscribe();

    this.currentProduct$ = this.palladiumApiService.products$.pipe(map((products: Product[]) => {
      const productId = this.stance.productId();
      const current_product = products.find(product => product.id === productId);
      this.sidenavService.selectedProductName$.next(current_product.name);
      return current_product
    }));
  }

  clicked(event, plan: Plan) {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      this.selectedPlanId = plan.id;
      this.router.navigate(['plan', plan.id], { relativeTo: this.activatedRoute }).then(() => { this.cd.detectChanges() });
      this.cd.detectChanges();
    }
  }

  set_current_product_name(id: number) {
    this.palladiumApiService.products$.pipe(take(1), map((products: Product[]) => {
      const current_product = products.find(product => product.id === id);
      this.sidenavService.selectedProductName$.next(current_product.name);
    })).subscribe();
  }

  init_plans(id: number) {
    this.loading = true;
    this.palladiumApiService.init_plans(id, this.stance.planId());
  }

  onActivate(componentRef) {
    this.RUN_COMPONENT = componentRef;
  }

  open_settings() {
    const dialogRef = this.dialog.open(PlansSettingsComponent, {
      data: {
        plan: this.planForSettings
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(result => {
      this.cd.detectChanges();
    });
  }

  open_create_plan() {
    const dialogRef = this.dialog.open(PlansCreateComponent, {
      data: {
        plans$: this.plans$
      }
    });
  }

  load_more_plans() {
    this.palladiumApiService.get_plans_show_more(this.stance.productId()).subscribe(result => {
      this.showMore = !(result.request_status == 'Is a last plans')
    });
  }

  archive_open() {
    if (confirm('Attention!! You will can not to undo this action')) {
      this.palladiumApiService.archive_plane(this.planForSettings.id);
    }
  }

  ngOnDestroy() {
    this.cd.detach();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}

@Component({
  selector: 'app-plan-settings',
  templateUrl: 'plans-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlansSettingsComponent implements OnInit {
  plan;
  item: Plan;
  _plans;
  planForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
    private palladiumApiService: PalladiumApiService, private router: Router, @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit(): void {
    this.item = this.data.plan;
    this.planForm.patchValue({ name: this.item.name });
  }

  get name() {
    return this.planForm.get('name');
  }

  edit_plan() {
    if (!this.name_is_not_changed()) {
      this.palladiumApiService.edit_plan(this.item.id, this.name.value);
    }
    this.dialogRef.close();
  }

  name_is_not_changed() {
    return this.item.name === this.name.value;
  }

  delete_plan() {
    if (confirm('A u shuare?')) {
      this.palladiumApiService.delete_plan(this.item.id);
      this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
      this.dialogRef.close();
    }
  }
}

export interface PlanCreationResponceInterface {
  plan: Plan,
  request_status?: string
}

@Component({
  selector: 'app-plan-create',
  templateUrl: 'plans-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlansCreateComponent implements OnInit {
  nameFormControl: FormControl;
  newerrorStateMatcher = new InstantErrorStateMatcher();
  plan_creating_status: { waiting: boolean, existed_plan?: Plan, error_message?: string };
  error_message: any;

  plans$: ReplaySubject<Plan[]> = new ReplaySubject(1);

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
    private stance: StanceService,
    private palladiumApiService: PalladiumApiService, private router: Router,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit(): void {
    this.error_message = '';
    this.plan_creating_status = { waiting: false };

    this.plans$ = this.data.plans$;
    this.plans$.pipe(take(1)).subscribe(plans => {
      this.nameFormControl = new FormControl(null, [Validators.required, validateNameExists(plans)]);
    })
  }

  create() {
    this.error_message_change('')
    this.plan_creating_status.waiting = true;
    this.palladiumApiService.create_plan(this.nameFormControl.value, this.stance.productId()).pipe(
      map((plan_creating_responce: PlanCreationResponceInterface) => {
        if (plan_creating_responce.request_status) {
          this.plan_creating_status = {
            waiting: false,
            error_message: plan_creating_responce.request_status,
            existed_plan: plan_creating_responce.plan
          };
          this.nameFormControl.setErrors({'validateNameExists': true})
          this.cd.detectChanges();
        } else {
          this.dialogRef.close();
        }
      })).subscribe()
  }

  error_message_change(message: string) {
    this.error_message = message;
    return message
  }

  getErrorMessage() {
    if (this.nameFormControl.hasError('required')) {
      return 'You must enter a value';
    }

    if (this.nameFormControl.hasError('validateNameExists')) {
      this.plans$.pipe(take(1), map(plans => {
        if (this.plan_creating_status.existed_plan) {
          return plans.concat(this.plan_creating_status.existed_plan)
        } else {
          return plans;
        }
      })).subscribe(plans => {
        this.plan_creating_status.existed_plan = plans.find(plan => plan.name == this.nameFormControl.value)
      })
      return 'Plan with this name is exist';
    }
  }
}
