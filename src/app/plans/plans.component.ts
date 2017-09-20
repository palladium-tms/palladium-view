import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Plan} from '../models/plan';
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
  plans: Plan[] = [];
  errorMessage;
  plan_settings_data = {};
  statuses;
  all_result = {};
  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private httpService: HttpService,  private router: Router,
              private statistic: StatusticService, private localsettings: LocalSettingsService ) { }

  ngOnInit() {
    // this.localsettings.set_suites_visibility(12);
    // this.localsettings.remove_suites_visibility(12);
    this.activatedRoute.params.subscribe((params: Params) => {
      this.plans = [];
      this.product_id = params.id;
      this.get_plans(this.product_id);
      this.ApiService.get_statuses().then(res => {
        this.statuses = res;
        this.statuses[0] = {name: 'Untested', color: '#ffffff', id: 0 }; // add untested status. FIXME: need to added automaticly
      });
      // console.log( this.statistic);
      // this.statistic.next(Object.assign({}, this.dataStore).todos);

    });
  }

  get_plans(product_id) {
    this.httpService.postData('/plans', 'plan_data[product_id]=' + this.product_id)
      .then(
        responce => {
          for (const current_plan of responce['plans'] ) {
            this.all_result[current_plan['id']] = {'all': 0, 'lost': 0};
            for (const statistic of current_plan['statistic']) {
              this.all_result[statistic['plan_id']]['all'] += statistic['count'];
              if (statistic['id'] === 0) {
                this.all_result[statistic['plan_id']]['lost'] = statistic['count'];
              }
            }
          }
          return(this.plans = responce['plans']);
        },
        error =>  this.errorMessage = <any>error).then(res => {
      this.get_suites(product_id);
    });
  }

  get_suites(product_id) {
    this.ApiService.get_suites(product_id).then(res => {
      // console.log(res);
      // console.log('123123123123');
    });
  }

  edit_plan(form: NgForm, modal, valid: boolean) {
    if ( !valid ) { return; }
    const params = 'plan_data[plan_name]=' + form.value['plan_name'] + '&plan_data[id]=' +  this.plan_settings_data['id'];
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
        error =>  this.errorMessage = <any>error);
    modal.close();
  }

  delete_plan(modal) {
    if (confirm('A u shuare?')) {
      this.httpService.postData('/plan_delete', 'plan_data[id]=' + this.plan_settings_data['id'])
      .then(
        (plans: any) => {
          this.plans.splice(this.plan_settings_data['index'], 1);
          if ( this.router.url.indexOf('/plan/' + plans['plan']) >= 0) {
            this.router.navigate([/(.*?)(?=plan|$)/.exec(this.router.url)[0]]);
          }
        },
        error =>  this.errorMessage = <any>error);
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
}
