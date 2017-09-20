import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Run} from '../models/run';
import {HttpService} from '../../services/http-request.service';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Suite} from '../models/suite';

declare var $: any;

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css']
})
export class RunsComponent implements OnInit {
  plan_id = null;
  runs: Run[] = [new Run(null)];
  statuses;
  errorMessage;
  run_settings_data = {};
  all_result = {};

  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.ApiService.get_statuses().then(res => {
        this.statuses = res;
        this.statuses[0] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      }).then(res => {
        this.get_runs(params['id']);
      });
    });
    if (this.router.url.indexOf('/run/') >= 0 && this.router.url.indexOf('/result_set/') <= 0) {
      $('.product-space').removeClass('very-big-column small-column').addClass('big-column');
      $('.plan-space').removeClass('small-column very-big-column').addClass('big-column');
      $('.run-space').removeClass('big-column small-column').addClass('very-big-column');
    }
  }

  get_runs(plan_id) {
    this.runs = [];
    this.ApiService.get_runs(plan_id).then(runs => {
      return(runs);
    }).then(runs => {
      // console.log(runs);
      this.runs = runs;
      this.activatedRoute.parent.params.subscribe(params => {
        return this.get_suites(params['id']);
      });
    }).then(res => {
      // console.log(res);
    });
  }

  delete_run(modal) {
    if (confirm('A u shuare?')) {
      this.httpService.postData('/run_delete', 'run_data[id]=' + this.run_settings_data['id'])
        .then(
          runs => {
            this.runs.splice(this.run_settings_data['index'], 1);
            if (this.router.url.indexOf('/run/' + runs['run']) >= 0) {
              this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
            }
          },
          error => this.errorMessage = <any>error);
      modal.close();
    }
  }

  edit_run(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    const params = 'run_data[run_name]=' + form.value['run_name'] + '&run_data[id]=' + this.run_settings_data['id'];
    this.httpService.postData('/run_edit', params)
      .then(
        (runs: any) => {
          if (Object.keys(runs.errors).length === 0) {
            this.runs[this.run_settings_data['index']].name = runs.run_data.name;
            this.runs[this.run_settings_data['index']].updated_at = runs.run_data.updated_at;
          }
        },
        error => this.errorMessage = <any>error);
    modal.close();
  }

  show_settings_button(index) {
    $('#' + index + '.run-setting-button').show();
  };

  hide_settings_button(index) {
    $('#' + index + '.run-setting-button').hide();
  };

  settings(modal, run, index, form) {
    this.run_settings_data = {id: run.id, index: index};
    modal.open();
    form.controls['run_name'].setValue(run.name);
  }

  set_space_width() {
    $('.lost-result').show();
    $('.product-space').removeClass('very-big-column').addClass('big-column');
    $('.plan-space').removeClass('very-big-column small-column').addClass('big-column');
    $('.run-space').removeClass('big-column small-column').addClass('very-big-column');
  }

  get_suites(id) {
    return this.ApiService.get_suites(id).then(suites => {
      Object(suites).forEach(suite => {
        if (this.runs.filter(run => run.name === suite.name).length === 0) {
          this.runs.push(new Run(suite));
        }
      });
    });
  }
}
