import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Plan} from '../models/plan';
import {HttpService} from '../../services/http-request.service';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {
  product_id = null;
  plans: Plan[] = [];
  errorMessage;
  plan_settings_data = {};
  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,  private router: Router ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.product_id = params.id;
      this.get_plans(this.product_id);
    });
  }

  get_plans(product_id) {
    this.httpService.postData('/api/plans', 'plan_data[product_id]=' + this.product_id)
      .subscribe(
        responce => {
          return(this.plans = responce['plans']);
        },
        error =>  this.errorMessage = <any>error);
  }

  edit_plan(form: NgForm, modal, valid: boolean) {
    if ( !valid ) { return; }
    const params = 'plan_data[plan_name]=' + form.value['plan_name'] + '&plan_data[id]=' +  this.plan_settings_data['id'];
    this.httpService.postData('/api/plan_edit', params)
      .subscribe(
        plans => {
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
      this.httpService.postData('/api/plan_delete', 'plan_data[id]=' + this.plan_settings_data['id'])
      .subscribe(
        plans => {
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
    $('#' + index + '.plan-setting-button').css('display', 'block');
  };
  hide_settings_button(index) {
    $('#' + index + '.plan-setting-button').css('display', 'none');
  };
  settings(modal, plan, index, form) {
    this.plan_settings_data = {id: plan.id, index: index};
    modal.open();
    form.controls['plan_name'].setValue(plan.name);
  }
}
