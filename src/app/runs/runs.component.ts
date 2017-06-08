import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Run} from '../models/run';
import {Status} from '../models/status';
import {HttpService} from '../../services/http-request.service';
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
  statuses: Status[] = [];
  errorMessage;
  run_settings_data = {};

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService, private router: Router ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.plan_id = params['id'];
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

  delete_run(modal) {
    if (confirm('A u shuare?')) {
      this.httpService.postData('/api/run_delete', 'run_data[id]=' + this.run_settings_data['id'])
      .subscribe(
        runs => {
          this.runs.splice(this.run_settings_data['index'], 1);
          if ( this.router.url.indexOf('/run/' + runs['run']) >= 0) {
            this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
          }
        },
        error =>  this.errorMessage = <any>error);
    modal.close();
    }
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
