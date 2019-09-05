import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, AfterViewInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StanceService} from '../../services/stance.service';
import {Router} from '@angular/router';
import {ProductSettingsComponent} from '../products/products.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {StatisticService} from '../../services/statistic.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansComponent implements OnInit, AfterViewInit {
  selectedPlan;
  productId;
  plan_for_settings;
  RUN_COMPONENT;
  loading = false;

  constructor(private palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              private statisticService: StatisticService,
              private activatedRoute: ActivatedRoute,
              private router: Router, private dialog: MatDialog,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.productId = params.id;
      this.init_data();
    });
    this.palladiumApiService.statusObservable.subscribe(() => {
      this.cd.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.statisticService.planSubject.subscribe(statistic => {
      this.palladiumApiService.plans[this.productId].find(plan => plan.id === this.stance.planId()).statistic = statistic;
      this.cd.detectChanges();
    });
  }

  clicked(event, plan) {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      this.selectedPlan = plan;
      this.router.navigate(['plan', this.selectedPlan.id], {relativeTo: this.activatedRoute});
    }
  }

  init_data() {
    this.loading = true;
    this.cd.detectChanges();
    this.selectedPlan = {id: 0};
    let promisePlans;
    if(this.stance.planId()) {
      promisePlans = this.palladiumApiService.get_plans_to_id(this.productId, this.stance.planId());
    } else {
      promisePlans = this.palladiumApiService.get_plans(this.productId);
    }
    Promise.all([promisePlans, this.palladiumApiService.get_suites(this.productId)]).then(() => {
      if (this.stance.planId()) {
        this.selectedPlan = this.palladiumApiService.plans[this.productId].find(plan => plan.id === this.stance.planId());
      }
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  onActivate(componentRef) {
    this.RUN_COMPONENT = componentRef;
  }

  open_settings() {
    const dialogRef = this.dialog.open(PlansSettingsComponent, {
      data: {
        plans: this.palladiumApiService.plans[this.productId],
        plan: this.plan_for_settings
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
    await this.palladiumApiService.get_plans(this.productId);
    this.cd.detectChanges();
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
