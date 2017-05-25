import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Plan} from '../models/plan';
import {PalladiumApiService} from '../../servises/palladium-api.service';

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
}
