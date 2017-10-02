import {Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Run} from '../models/run';
import {Suite} from '../models/suite';
import {HttpService} from '../../services/http-request.service';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';

declare var $: any;

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css']
})
export class RunsComponent implements OnInit {
  runs = [];
  suites = [];
  runs_and_suites = [];
  statuses;
  errorMessage;
  run_settings_data = {};
  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private httpService: HttpService, private router: Router) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.ApiService.get_statuses().then(res => {
        this.statuses = res;
        this.statuses[0] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      }).then(res => {
        this.get_runs(params['id']);
      });
    });
    if (this.router.url.indexOf('/suite/') >= 0 || this.router.url.indexOf('/run/') >= 0 && this.router.url.indexOf('/result_set/') <= 0) {
      $('.product-space').removeClass('very-big-column small-column').addClass('big-column');
      $('.plan-space').removeClass('small-column very-big-column').addClass('big-column');
      $('.run-space').removeClass('big-column small-column').addClass('very-big-column');
    }
  }

  get_runs(plan_id) {
    this.runs_and_suites = [];
    this.runs = [];
    this.suites = [];
    this.ApiService.get_runs(plan_id).then(runs => {
      Object(runs).forEach(run => {
        this.runs.push(new Run(run));
      });
      return (runs);
    }).then(runs => {
      return this.activatedRoute.parent.params.subscribe(params => {
        return this.get_runs_and_suites(params['id']);
      });
    });
  }

  delete_object(modal) {
    // if (this.run_settings_data.constructor.name)
    console.log(this.run_settings_data['object'].constructor.name === 'Suite');
    if (this.run_settings_data['object'].constructor.name === 'Suite') {
      if (confirm('A u shuare?')) {
        this.ApiService.delete_suite(this.run_settings_data['id']).then(suite => {
          this.runs_and_suites.splice(this.run_settings_data['index'], 1);
          if (this.router.url.indexOf('/suite/' + suite['id']) >= 0) {
            this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]]);
          }
        });
        modal.close();
      }
    } else {
      if (confirm('A u shuare?')) {
        this.httpService.postData('/run_delete', 'run_data[id]=' + this.run_settings_data['id'])
          .then(
            runs => {
              this.runs_and_suites[this.run_settings_data['index']] = new Suite(this.runs_and_suites[this.run_settings_data['index']]);
              if (this.router.url.indexOf('/run/' + runs['run']) >= 0) {
                this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
              }
            },
            error => this.errorMessage = <any>error);
        modal.close();
      }
    }
  }

  edit_run(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    console.log(this.run_settings_data['object'].constructor.name === 'Run');
    if (this.run_settings_data['object'].constructor.name === 'Run') {
      this.ApiService.edit_suite_by_run_id( this.run_settings_data['id'], form.value['run_name']).then(suite => {
        const object_for_change = this.runs_and_suites.filter(object => object.id === this.run_settings_data['id'])[0];
        object_for_change.name = suite.name;
        object_for_change.updated_at = suite.updated_at;
      });
    } else {
      this.ApiService.edit_suite( this.run_settings_data['id'], form.value['run_name']).then(suite => {
        const object_for_change = this.runs_and_suites.filter(object => object.id === this.run_settings_data['id'])[0];
        object_for_change.name = suite.name;
        object_for_change.updated_at = suite.updated_at;
      });
    }
    modal.close();
  }

  show_settings_button(index) {
    $('#' + index + '.run-setting-button').show();
  };

  hide_settings_button(index) {
    $('#' + index + '.run-setting-button').hide();
  };

  settings(modal, run, index, form) {
    this.run_settings_data = {object: run, id: run.id, index: index};
    modal.open();
    form.controls['run_name'].setValue(run.name);
  }

  set_space_width() {
    $('.lost-result').show();
    $('.product-space').removeClass('very-big-column').addClass('big-column');
    $('.plan-space').removeClass('very-big-column small-column').addClass('big-column');
    $('.run-space').removeClass('big-column small-column').addClass('very-big-column');
  }

  log(val) {
    console.log(val);
  }

  get_runs_and_suites(id) {
    this.ApiService.get_suites(id).then(suites => {
      Object(suites).forEach(suite => {
        const same = this.runs.filter(run => run.name === suite.name);
        if (same.length === 0) {
          this.suites.push(new Suite(suite));
        } else if (same[0].all_statistic['all'] !== suite.all_statistic['all']) {
          const untested = suite.all_statistic['all'] - same[0].all_statistic['all'];
          same[0].statistic.push({plan_id:  same[0].id, status: 0, count: untested});
          same[0].get_statistic();
        }
      });
      this.runs_and_suites = this.runs.concat(this.suites);
    });
  }
}
