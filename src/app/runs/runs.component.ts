import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Run} from '../models/run';
import {PalladiumApiService} from '../../servises/palladium-api.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css']
})
export class RunsComponent implements OnInit {
  plan_id = null;
  runs: Run[] = [];
  errorMessage;

  constructor(private activatedRoute: ActivatedRoute, private httpService: PalladiumApiService ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.plan_id = params['id'];
      // this.get_plans(this.product_id);
      this.get_runs(this.plan_id);
    });
  }

  get_runs(plan_id) {
    this.httpService.postData('/api/runs', 'run_data[plan_id]=' + this.plan_id)
      .subscribe(
        responce => {
          return(this.runs = responce['runs']);
        },
        error =>  this.errorMessage = <any>error);
  }
}
