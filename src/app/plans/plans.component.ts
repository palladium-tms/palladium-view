import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Plan} from '../models/plan';
import {NgForm} from '@angular/forms';
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
  plans: Plan[] = [new Plan(null)];
  plan;
  @ViewChild('Modal') Modal;
  @ViewChild('form') form;
  plan_settings_data = {};
  menuItems = [
    {label: '<span class="menu-icon">Refresh</span>', onClick: this.get_plans_and_suites.bind(this)},
    {label: '<span class="menu-icon">Edit</span>', onClick: this.open_modal.bind(this)},
    {label: '<span class="menu-icon">Delete</span>', onClick: this.delete_plan.bind(this)}];
  statuses;

  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.product_id = params.id;
      this.get_plans_and_suites();
      this.ApiService.get_statuses().then(res => {
        this.statuses = res;
        this.statuses[0] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      });
    });
  }

  get_plans(product_id) {
    return this.ApiService.get_plans(product_id).then(plans => {
      return plans;
    });
  }

  get_suites(product_id) {
    return this.ApiService.get_suites(product_id).then(suites => {
      return suites;
    });
  }

  count_of_cases(suites) {
    let cases_count = 0;
    suites.forEach(suite => {
      cases_count += suite.statistic.all;
    });
    return cases_count;
  }

  get_plans_and_suites() {
    Promise.all([this.get_plans(this.product_id), this.get_suites(this.product_id)]).then(res => {
      this.plans = res[0];
      this.plans.forEach(plan => {
        this.update_statistic(plan, this.count_of_cases(res[1]));
      });
    });
  }

  edit_plan_modal(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    this.edit_plan(this.plan.id, form.value['name']);
    modal.close();
  }

  edit_plan(id, name) {
    this.ApiService.edit_plan(id, name).then(plan => {
      console.log(plan);
      this.plans.forEach(current_plan => {
        if (current_plan.id === plan.id) {
          current_plan.name = plan.name;
          current_plan.updated_at = plan.updated_at;
        } // FIXME: need optimize
      });
    });
  }

  delete_plan(plan) {
    if (confirm('A u shuare?')) {
      this.ApiService.delete_plan(plan.dataContext.id).then(plan_id => {
        this.plans = this.plans.filter(current_plan => current_plan.id !== +plan_id);
        if (this.router.url.indexOf('/plan/' + plan_id) >= 0) {
          this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
        }
      });
    }
  }

  settings(modal, plan, index, form) {
    this.plan_settings_data = {id: plan.id, index: index};
    modal.open();
    form.controls['plan_name'].setValue(plan.name);
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

  open_modal(plan) {
    this.plan = this.plans.filter(current_plan => current_plan.id === plan.dataContext.id)[0];
    this.form.controls['name'].setValue(this.plan.name);
    this.Modal.open();
  };
}
