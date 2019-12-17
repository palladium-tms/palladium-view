import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService, StructuredPlans} from '../../services/palladium-api.service';
import {StanceService} from '../../services/stance.service';
import {Router} from '@angular/router';
import {ProductSettingsComponent} from '../products/products.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {StatisticService} from '../../services/statistic.service';
import {SidenavService} from '../../services/sidenav.service';
import {Product} from "../models/product";
import {Plan} from "../models/plan";

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansComponent implements OnInit {
  plans: Plan[];
  selectedPlanId = 0;
  productId;
  planForSettings;
  RUN_COMPONENT;
  loading = false;
  showMore = true;
  selectedProduct: Product = {createdAt: 0, updatedAt: 0, id: 0, name: ''};

  constructor(public palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              public sidenavService: SidenavService,
              private statisticService: StatisticService,
              private activatedRoute: ActivatedRoute,
              private router: Router, private dialog: MatDialog,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activatedRoute.params.pluck('id').map(id => +id).switchMap(id => {
      this.productId = id;
      this.init_plans(id);
      this.cd.detectChanges();
      return this.palladiumApiService.products$.map(products => {
        this.selectedProduct = products.find(product => product.id === id);
        if (this.selectedProduct) {
          this.sidenavService.select_product(this.selectedProduct);
        } else {
          this.sidenavService.select_product(this.selectedProduct);
          this.router.navigate(['/']);
        }
      });
    }).subscribe();

    this.activatedRoute.params.pluck('id').map(id => +id).switchMap(id => {
      return this.palladiumApiService.plans$.map((plans: StructuredPlans) => {
        this.plans = plans[id];
        if (this.stance.planId()) {
          console.log(this.plans)
          console.log(this.stance.planId())
          this.selectedPlanId = this.plans.find(plan => plan.id === this.stance.planId()).id;
        }
        this.cd.detectChanges();
      });
    }).subscribe();
    //
    // this.palladiumApiService.plans$.map((plans: StructuredPlans) => {
    //   console.log('asdjkliasjdlksajdfkli');
    //   this.plans = plans[this.stance.productId()];
    //   if (this.stance.planId()) {
    //     console.log(this.plans);
    //     console.log(this.stance.planId());
    //     this.selectedPlanId = this.plans.find(plan => plan.id === this.stance.planId()).id;
    //   }
    //   console.log(this.plans)
    //   this.cd.detectChanges();
    // }).subscribe();
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.palladiumApiService.plans[this.productId] = result;
        this.cd.detectChanges();
      }
    });
  }

  async load_more_plans() {
    console.log(this.productId);
    this.palladiumApiService.get_more_plans(this.productId);
  }

  archive_open() {
    if (confirm('Attention!! You will can not to undo this action')) {
      this.palladiumApiService.archive_plane(this.planForSettings.id);
    }
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
    this.dialogRef.close(this._plans);
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
