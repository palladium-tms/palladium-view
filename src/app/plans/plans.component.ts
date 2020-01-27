import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject, OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService, StructuredPlans} from '../../services/palladium-api.service';
import {StanceService} from '../../services/stance.service';
import {Router} from '@angular/router';
import {ProductSettingsComponent} from '../products/products.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {StatisticService} from '../../services/statistic.service';
import {Plan} from "../models/plan";
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansComponent implements OnInit, OnDestroy {
  plans$: ReplaySubject<Plan[]> =  new ReplaySubject(1);
  activeRoute$: Observable<{}>;
  private unsubscribe: Subject<void> = new Subject();

  plans: Plan[];
  selectedPlanId = 0;
  planForSettings;
  RUN_COMPONENT;
  loading = false;
  showMore = true;

  constructor(public palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              private statisticService: StatisticService,
              private activatedRoute: ActivatedRoute,
              private router: Router, private dialog: MatDialog,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.activeRoute$ = this.activatedRoute.params.pluck('id').map(id => {
      this.init_plans(id);
      return +id;
    });

    this.activeRoute$.switchMap((id: number) => {
      return this.palladiumApiService.plans$.map((plans: StructuredPlans) => this.plans$.next(plans[id]));
    }).pipe(takeUntil(this.unsubscribe)).subscribe();
  }

  clicked(event, plan) {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      if (this.selectedPlanId === plan.id) {
        return;
      }
      this.selectedPlanId = plan.id;
      this.router.navigate(['plan', plan.id], {relativeTo: this.activatedRoute});
      this.cd.detectChanges();
    }
  }

  init_plans(id) {
    this.palladiumApiService.init_plans(id, this.stance.planId());
  }

  // init_data() {
  //   this.loading = true;
  //   this.cd.detectChanges();
  //   this.selectedPlan = 0;
  //   let promisePlans;
  //   if (this.stance.planId()) {
  //     promisePlans = this.palladiumApiService.get_plans_to_id(this.productId, this.stance.planId());
  //   } else if (!this.palladiumApiService.plans[this.productId]) {
  //     promisePlans = this.palladiumApiService.get_plans(this.productId, 0);
  //   } else {
  //     promisePlans = Promise.resolve(this.palladiumApiService.plans[this.productId]);
  //   }
  //   Promise.all([promisePlans]).then(() => {
  //     if (this.stance.planId()) {
  //       this.selectedPlan = this.palladiumApiService.plans[this.productId].find(plan => plan.id === this.stance.planId()).id;
  //     }
  //     this.loading = false;
  //     this.cd.detectChanges();
  //   });
  // }

  onActivate(componentRef) {
    this.RUN_COMPONENT = componentRef;
  }

  open_settings() {
    const dialogRef = this.dialog.open(PlansSettingsComponent, {
      data: {
        plans: this.plans,
        plan: this.planForSettings
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(result => {
        this.cd.detectChanges();
    });
  }

  async load_more_plans() {
    this.palladiumApiService.get_plans_show_more(this.stance.productId());
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
  item;
  _plans;
  planForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private palladiumApiService: PalladiumApiService, private router: Router, @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit(): void {
    this._plans = this.data.plans;
    this.item = this.data.plan;
    this.planForm.patchValue({name: this.item.name});
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

  name_is_existed() {
    if (this.item) {
      if (this.name_is_not_changed()) {
        return false;
      }
      return this._plans.some(product => product.name === this.name.value);
    }
  }

  name_is_not_changed() {
    return this.item.name === this.name.value;
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.planForm.controls['name'].setErrors({'incorrect': true});
    }
  }

  delete_plan() {
    if (confirm('A u shuare?')) {
      this.palladiumApiService.delete_plan(this.item.id);
      this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
      this.dialogRef.close();
    }
  }
}
