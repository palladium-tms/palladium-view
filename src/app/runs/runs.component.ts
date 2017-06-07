import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Run} from '../models/run';
import {PalladiumApiService} from '../../servises/palladium-api.service';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css']
})
export class RunsComponent implements OnInit {
  plan_id = null;
  runs: Run[] = [];
  errorMessage;
  run_settings_data = {};

  constructor(private activatedRoute: ActivatedRoute, private httpService: PalladiumApiService, private router: Router ) { }

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
          if ( this.router.url.indexOf('/run/' + runs['run']) >= 0) {
            this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
          }
        },
        error =>  this.errorMessage = <any>error);
  }
  edit_run(form: NgForm, modal, valid: boolean) {
    if ( !valid ) { return; }
    const params = 'run_data[run_name]=' + form.value['run_name'] + '&run_data[id]=' +  this.run_settings_data['id'];
    this.httpService.postData('/api/run_edit', params)
      .subscribe(
        runs => {
          if (Object.keys(runs.errors).length === 0) {
            console.log(runs);
            this.runs[this.run_settings_data['index']].name = runs.run_data.name;
            this.runs[this.run_settings_data['index']].updated_at = runs.run_data.updated_at;
          } else {
            console.log(runs.errors);
          }
        },
        error =>  this.errorMessage = <any>error);
    modal.close();
  }
  show_settings_button(index) {
    $('#' + index + '.run-setting-button').css('display', 'block');
  };
  hide_settings_button(index) {
    $('#' + index + '.run-setting-button').css('display', 'none');
  };

  settings(modal, run, index, form) {
    this.run_settings_data = {id: run.id, index: index};
    modal.open();
    form.controls['run_name'].setValue(run.name);
  }
}
