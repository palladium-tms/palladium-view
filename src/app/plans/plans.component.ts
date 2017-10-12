import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Plan} from '../models/plan';
import {HttpService} from '../../services/http-request.service';
import {NgForm} from '@angular/forms';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Router} from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  providers: [PalladiumApiService]
})
export class PlansComponent implements OnInit {
  product_id = null;
  plans: Plan[] = [new Plan(null)];
  errorMessage;
  plan_settings_data = {};
  statuses;

  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.product_id = params.id;
      this.get_plans_and_suites(this.product_id);
      this.ApiService.get_statuses().then(res => {
        this.statuses = res;
        this.statuses[0] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      });
    });
  }

  get_plans(product_id) {
    return this.ApiService.get_plans(product_id).then(plans => { return plans; });
  }
  get_suites(product_id) {
    return this.ApiService.get_suites(product_id).then(suites => { return suites; });
  }
  count_of_cases(suites) {
    let cases_count = 0;
    suites.forEach(suite => {
      cases_count += suite.statistic.all;
    });
    return cases_count;
  }

  get_plans_and_suites(product_id) {
    Promise.all([this.get_plans(product_id), this.get_suites(product_id)]).then(res => {
      this.plans = res[0];
      this.plans.forEach(plan => {
        this.update_statistic(plan, this.count_of_cases(res[1]));
      });
    });
  }

  edit_plan(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    const params = 'plan_data[plan_name]=' + form.value['plan_name'] + '&plan_data[id]=' + this.plan_settings_data['id'];
    this.httpService.postData('/plan_edit', params)
      .then(
        (plans: any) => {
          if (Object.keys(plans.errors).length === 0) {
            this.plans[this.plan_settings_data['index']].name = plans.plan_data.name;
            this.plans[this.plan_settings_data['index']].updated_at = plans.plan_data.updated_at;
          } else {
            console.log(plans.errors);
          }
        },
        error => this.errorMessage = <any>error);
    modal.close();
  }

  delete_plan(modal) {
    if (confirm('A u shuare?')) {
      this.httpService.postData('/plan_delete', 'plan_data[id]=' + this.plan_settings_data['id'])
        .then(
          (plans: any) => {
            this.plans.splice(this.plan_settings_data['index'], 1);
            if (this.router.url.indexOf('/plan/' + plans['plan']) >= 0) {
              this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
            }
          },
          error => this.errorMessage = <any>error);
      modal.close();
    }
  }

  show_settings_button(index) {
    $('#' + index + '.plan-setting-button').show();
  };

  hide_settings_button(index) {
    $('#' + index + '.plan-setting-button').hide();
  };

  settings(modal, plan, index, form) {
    this.plan_settings_data = {id: plan.id, index: index};
    modal.open();
    form.controls['plan_name'].setValue(plan.name);
  }

  set_space_width() {
    $('.lost-result').show();
    $('.product-space').removeClass('big-column small-column').addClass('very-big-column');
    $('.plan-space').removeClass('small-column big-column').addClass('very-big-column');
    $('.run-space').removeClass('big-column small-column').addClass('very-big-column');
  }

  open_runs(id) {
    this.set_space_width();
    if (this.router.url.indexOf('/plan/' + id) > 0 ) {
      this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]], true);
    }
  }

  log(val) {
    console.log(val);
  }

  update_statistic(plan, count_of_cases) {
    if (plan.all_statistic['all'] < count_of_cases) {
      const untested = count_of_cases - plan.all_statistic['all'];
      plan.statistic.push({plan_id: plan.id, status: 0, count: untested});
      plan.get_statistic();
    }
    return (plan);
  }
}
