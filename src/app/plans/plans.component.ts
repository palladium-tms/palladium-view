import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Router} from '@angular/router';
import {ProductSettingsComponent} from '../products/products.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [PalladiumApiService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansComponent implements OnInit {
  selectedPlan = {id: 0};
  productId;
  plans = [];
  RUN_COMPONENT;
  statuses;
  loading = false;

  constructor(private palladiumApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private router: Router, private dialog: MatDialog, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.productId = params.id;
      this.init_data();
    });
  }

  async get_plans(id) {
    return this.palladiumApiService.get_plans(id);
  }

  get_suites(id) {
    return this.palladiumApiService.get_suites(id).then(suites => {
      return suites;
    });
  }

  get_statuses() {
    this.palladiumApiService.get_statuses().then(res => {
      this.statuses = res;
    });
  }

  clicked(event, plan) {
    if (event.target.classList.contains('settings')) {
      this.open_settings(plan);
    } else {
      this.selectedPlan = plan;
      this.router.navigate(['plan', this.selectedPlan.id], {relativeTo: this.activatedRoute});
    }
  }

  count_of_cases(suites) {
    let casesCount = 0;
    suites.forEach(suite => {
      casesCount += suite.statistic.all;
    });
    return casesCount;
  }

  init_data() {
    this.plans = [];
    this.loading = true;
    Promise.all([this.get_plans(this.productId), this.get_suites(this.productId), this.get_statuses()]).then(res => {
      this.plans = res[0][this.productId] || [];
      this.plans.forEach(plan => {
        this.update_statistic(plan, this.count_of_cases(res[1][this.productId]));
      });
      const planId = this.router.url.match(/plan\/(\d+)/i);
      if (planId) {
        this.selectedPlan = this.plans.find(plan => plan.id === +planId[1]);
      }
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  update_click() {
    if (this.loading) {return;}
    this.init_data();
    if (this.RUN_COMPONENT) {
      this.RUN_COMPONENT.update_click();
    }
  }

  onActivate(componentRef) {
    this.RUN_COMPONENT = componentRef;
  }

  update_statistic(plan, casesCount) {
    if (plan.all_statistic['all'] < casesCount) {
      const untested = casesCount - plan.all_statistic['all'];
      plan.statistic.push({plan_id: plan.id, status: 0, count: untested});
      plan.get_statistic();
    }
    return (plan);
  }

  force_floor(data) {
    return (Math.floor(data * 100) / 100);
  }

  open_settings(plan) {
    const dialogRef = this.dialog.open(PlansSettingsComponent, {
      data: {
        plans: this.plans,
        plan
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.plans = result;
      }
    });
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === +id);
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
  plans;
  planForm = new FormGroup({
    name: new FormControl('',  [Validators.required])
  });
  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private palladiumApiService: PalladiumApiService, private router: Router, @Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit(): void {
    this.plans = this.data.plans;
    this.item = this.data.plan;
    this.planForm.patchValue({name: this.item.name});
  }

  get name() { return this.planForm.get('name'); }

  async edit_plan() {
    if (!this.name_is_not_changed()) {
      const plan = await this.palladiumApiService.edit_plan(this.item.id, this.name.value);
      this.plans.filter(x => x.id === plan.id)[0].name = plan.name;
    }
    this.dialogRef.close(this.plans);
  }

  name_is_existed() {
    if (this.item) {
      if (this.name_is_not_changed()) { return false; }
      return this.plans.some(product => product.name === this.name.value);
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
      this.plans = this.plans.filter(currentPlan => currentPlan.id !== this.item.id);
      this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
      this.dialogRef.close(this.plans);
    }
  }
}
