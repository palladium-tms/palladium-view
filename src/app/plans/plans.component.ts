import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
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
  providers: [PalladiumApiService]
})
export class PlansComponent implements OnInit {
  selected_plan = {id: 0};
  product_id;
  plans = [];
  plan;
  RunComponent;
  statuses;
  loading = false;
  errors = {};
  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private router: Router, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.product_id = params.id;
      this.init_data();
    });
  }

  async get_plans(product_id) {
    return await this.ApiService.get_plans(product_id)
  }

  get_suites(product_id) {
    return this.ApiService.get_suites(product_id).then(suites => {
      return suites;
    });
  }

  get_statuses() {
    this.ApiService.get_statuses().then(res => {
      this.statuses = res;
    });
  }

  clicked(event, plan) {
    if (event.target.classList.contains('settings')) {
      this.open_settings(plan);
    } else {
      this.selected_plan = plan;
      this.router.navigate(['plan', this.selected_plan.id], {relativeTo: this.activatedRoute});
    }
  }

  count_of_cases(suites) {
    let cases_count = 0;
    suites.forEach(suite => {
      cases_count += suite.statistic.all;
    });
    return cases_count;
  }

  init_data() {
    this.plans = [];
    this.loading = true;
    Promise.all([this.get_plans(this.product_id), this.get_suites(this.product_id), this.get_statuses()]).then(res => {
      this.plans = res[0][this.product_id] || [];
      this.plans.forEach(plan => {
        this.update_statistic(plan, this.count_of_cases(res[1][this.product_id]));
      });
      const plan_id = this.router.url.match(/plan\/(\d+)/i);
      if (plan_id) {
        this.selected_plan = this.plans.find(plan => plan.id == plan_id[1])
      }
      this.loading = false;
    });
  }

  update_click() {
    if (this.loading) {return}
    this.init_data();
    if (this.RunComponent) {
      this.RunComponent.update_click();
    }
  }

  onActivate(componentRef) {
    this.RunComponent = componentRef;
  }

  update_statistic(plan, count_of_cases) {
    if (plan.all_statistic['all'] < count_of_cases) {
      const untested = count_of_cases - plan.all_statistic['all'];
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
        plan: plan
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.plans = result;
      }
    });
  };

  toolbar_opened() {
    return this.router.url.indexOf('plan') >= 0;
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === +id);
  }
}


@Component({
  selector: 'app-plan-settings',
  templateUrl: 'plans-settings.component.html',
})

export class PlansSettingsComponent implements OnInit {
  plan;
  item;
  plans;
  plan_form = new FormGroup({
    name: new FormControl('',  [Validators.required])
  });
  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private ApiService: PalladiumApiService, private router: Router, @Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit(): void {
    this.plans = this.data.plans;
    this.item = this.data.plan;
    this.plan_form.patchValue({name: this.item.name});
  }

  get name() { return this.plan_form.get('name'); }

  async edit_plan() {
    if (!this.name_is_not_changed()) {
      const plan = await this.ApiService.edit_plan(this.item.id, this.name.value);
      this.plans.filter(x => x.id == plan.id)[0].name = plan.name;
    }
    this.dialogRef.close(this.plans);
  }

  name_is_existed() {
    if (this.item) {
      if (this.name_is_not_changed()) { return false }
      return this.plans.some(product => product.name == this.name.value);
    }
  }

  name_is_not_changed() {
    return this.item.name == this.name.value;
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.plan_form.controls['name'].setErrors({'incorrect': true});
    }
  }

  async delete_plan() {
    if (confirm('A u shuare?')) {
      await this.ApiService.delete_plan(this.item.id);
      this.plans = this.plans.filter(current_plan => current_plan.id !== this.item.id);
      this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
      this.dialogRef.close(this.plans);
    }
  }
}
