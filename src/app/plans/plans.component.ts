import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Plan} from '../models/plan';
import {PalladiumApiService} from '../../servises/palladium-api.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {
  product_id = null;
  plans: Plan[] = [];
  errorMessage;
  constructor(private activatedRoute: ActivatedRoute, private httpService: PalladiumApiService ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.product_id = params.id;
      // console.log(params.id);
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

  edit_plan(form: NgForm, id: number, index: number) {
    const params = 'plan_data[plan_name]=' + form.value['plan_name'] + '&plan_data[id]=' +  id;
    this.httpService.postData('/api/plan_edit', params)
      .subscribe(
        plans => {
          if (Object.keys(plans.errors).length === 0) {
            this.plans[index].name = plans.plan_data.name;
            this.plans[index].updated_at = plans.plan_data.updated_at;
          } else {
            console.log(plans.errors);
          }
        },
        error =>  this.errorMessage = <any>error);
  }

  delete_plan(plan_id, index) {
    this.httpService.postData('/api/plan_delete', 'plan_data[id]=' + plan_id)
      .subscribe(
        plans => {
          this.plans.splice(index, 1);
        },
        error =>  this.errorMessage = <any>error);
  }
}
