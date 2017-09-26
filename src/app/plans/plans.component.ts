import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Plan} from '../models/plan';
import {Suite} from '../models/suite';
import {HttpService} from '../../services/http-request.service';
import {NgForm} from '@angular/forms';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Router} from '@angular/router';
import {StatusticService} from '../../services/statistic.service';
import {LocalSettingsService} from '../../services/local-settings.service';

declare var $: any;

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  providers: [PalladiumApiService, LocalSettingsService]
})
export class PlansComponent implements OnInit {
  product_id = null;
  plans: Plan[] = [new Plan(null)];
  suites: Suite[] = [new Suite(null)];
  cases_count: number = 0;
  errorMessage;
  plan_settings_data = {};
  statuses;

  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private httpService: HttpService, private router: Router,
              private statistic: StatusticService, private localsettings: LocalSettingsService) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.product_id = params.id;
      this.get_plans(this.product_id);
      this.ApiService.get_statuses().then(res => {
        this.statuses = res;
        this.statuses[0] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      });
    });
  }

  get_plans(product_id) {
    this.ApiService.get_plans(product_id).then(plans => {
      this.plans = plans;
    }).then(res => {
      return this.ApiService.get_suites(product_id).then(suites => {
        Object(suites).forEach(suite => {
          this.cases_count += suite.statistic['count'];
        });
      });
    }).then(res => {
      Object(this.plans).forEach(plan => {
        plan = this.update_statistic(plan);
      });
      console.log(this.suites);
      console.log(this.plans);
      // merge_and_update_statistic()
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
    $('.product-space').removeClass('big-column small-column').addClass('very-big-column');
    $('.plan-space').removeClass('small-column big-column').addClass('very-big-column');
    $('.run-space').removeClass('big-column small-column').addClass('very-big-column');
  }

  log(val) {
    console.log(val);
  }
  update_statistic(plan) {
    const untested = this.cases_count - plan.all_statistic['all'];
    console.log(untested);
    plan.statistic.push({plan_id: plan.id, status: 0, count: untested});
    plan.get_statistic();
    return(plan);
  }
}
