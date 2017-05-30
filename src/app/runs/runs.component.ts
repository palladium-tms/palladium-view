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

  delete_run(run_id, index) {
    this.httpService.postData('/api/run_delete', 'run_data[id]=' + run_id)
      .subscribe(
        runs => {
          this.runs.splice(index, 1);
        },
        error =>  this.errorMessage = <any>error);
  }
  edit_run(form: NgForm, id: number, index: number) {
    const params = 'run_data[run_name]=' + form.value['run_name'] + '&run_data[id]=' +  id;
    this.httpService.postData('/api/run_edit', params)
      .subscribe(
        runs => {
          if (Object.keys(runs.errors).length === 0) {
            console.log(runs);
            this.runs[index].name = runs.run_data.name;
            this.runs[index].updated_at = runs.run_data.updated_at;
          } else {
            console.log(runs.errors);
          }
        },
        error =>  this.errorMessage = <any>error);
  }
}
