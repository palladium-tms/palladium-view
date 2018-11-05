import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [PalladiumApiService]
})
export class PlansComponent implements OnInit {
  product_id = null;
  plans = [];
  plan;
  RunComponent;
  @ViewChild('Modal') Modal;
  plan_form = new FormGroup({
    name: new FormControl('',  [Validators.required])
  });
  statuses;
  loading = false;
  errors = {};
  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.product_id = params.id;
      this.init_data();
    });
  }
  get name() { return this.plan_form.get('name'); }

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

  async edit_plan() {
    if (!this.name_is_not_changed()) {
      const plan = await this.ApiService.edit_plan(this.plan.id, this.name.value);
      this.plans.filter(x => x.id == plan.id)[0].name = plan.name;
    }
    this.Modal.close();
  }

  name_is_existed() {
    if (this.plan) {
      if (this.name_is_not_changed()) { return false }
      return this.plans.some(product => product.name == this.name.value);
    }
  }

  name_is_not_changed() {
    return this.plan.name == this.name.value;
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.plan_form.controls['name'].setErrors({'incorrect': true});
    }
  }

  async delete_plan(id) {
    if (confirm('A u shuare?')) {
      await this.ApiService.delete_plan(id);
      this.Modal.close();
      this.plans = this.plans.filter(current_plan => current_plan.id !== +id);
      if (this.router.url.indexOf('/plan/' + id) >= 0) {
         this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
       }
    }
  }
  delete_selected_plan() {
    this.delete_plan( +/plan\/(\d+)/.exec(this.router.url)[1]);
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

  open_modal() {
    if (this.loading) {return}
    this.errors = {};
    this.plan = this.plans.filter(current_plan => current_plan.id === +/plan\/(\d+)/.exec(this.router.url)[1])[0];
    this.plan_form.patchValue({name: this.plan.name});
    this.Modal.open();
  };

  toolbar_opened() {
    return this.router.url.indexOf('plan') >= 0;
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === +id);
  }
}
