import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StanceService} from '../../services/stance.service';
import {Router} from '@angular/router';
import {ProductSettingsComponent} from '../products/products.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansComponent implements OnInit {
  selectedPlan = {id: 0};
  productId;
  plan_for_settings;
  _plans = [];
  RUN_COMPONENT;
  statuses;
  loading = false;

  constructor(private palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              private activatedRoute: ActivatedRoute,
              private router: Router, private dialog: MatDialog,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.productId = params.id;
      this.init_data();
    });
  }

  clicked(event, plan) {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      this.selectedPlan = plan;
      this.router.navigate(['plan', this.selectedPlan.id], {relativeTo: this.activatedRoute});
    }
  }

  async init_data() {
    this.loading = true;
    let observablePlans;
    if(this.stance.planId()) {
      observablePlans = this.palladiumApiService.get_plans_to_id(this.productId, this.stance.planId());
    } else {
      observablePlans = this.palladiumApiService.get_plans(this.productId);
    }
    const observableSuites = this.palladiumApiService.get_suites(this.productId);
    const observableStatus = this.palladiumApiService.get_statuses();
    await observablePlans;
    await observableSuites;
    this.statuses = await observableStatus;
    this.palladiumApiService.update_plan_statistic(this.productId);
    this._plans = this.palladiumApiService.plans[this.productId] || [];
    if (this.stance.planId()) {
      this.selectedPlan = this._plans.find(plan => plan.id === this.stance.planId());
    }
    this.loading = false;
    this.cd.detectChanges();
  }

  onActivate(componentRef) {
    this.RUN_COMPONENT = componentRef;
  }

  force_floor(data) {
    return (Math.floor(data * 100) / 100);
  }

  open_settings() {
    const dialogRef = this.dialog.open(PlansSettingsComponent, {
      data: {
        plans: this._plans,
        plan: this.plan_for_settings
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._plans = result;
      }
    });
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === +id);
  }

  async load_more_plans() {
    console.log('load_more_plans');
    await this.palladiumApiService.get_plans(this.productId);
    this.palladiumApiService.update_plan_statistic(this.productId);
    this.cd.detectChanges();
    // async this.palladiumApiService.get_plans(this.productId, this.plans.length);
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
    name: new FormControl('',  [Validators.required])
  });
  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private palladiumApiService: PalladiumApiService, private router: Router, @Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit(): void {
    this._plans = this.data.plans;
    this.item = this.data.plan;
    this.planForm.patchValue({name: this.item.name});
  }

  get name() { return this.planForm.get('name'); }

  async edit_plan() {
    if (!this.name_is_not_changed()) {
      const plan = await this.palladiumApiService.edit_plan(this.item.id, this.name.value);
      this._plans.filter(x => x.id === plan.id)[0].name = plan.name;
    }
    this.dialogRef.close(this._plans);
  }

  name_is_existed() {
    if (this.item) {
      if (this.name_is_not_changed()) { return false; }
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

  async delete_plan() {
    if (confirm('A u shuare?')) {
      await this.palladiumApiService.delete_plan(this.item.id);
      this._plans = this._plans.filter(currentPlan => currentPlan.id !== this.item.id);
      this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
      this.dialogRef.close(this._plans);
    }
  }
}
