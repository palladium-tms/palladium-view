import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.css']
})
export class CaseHistoryComponent implements OnInit {
  history;
  statuses;
  loading = false;
  results_data = {};
  constructor( private activatedRoute: ActivatedRoute, private location: Location,
               private ApiService: PalladiumApiService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.init_data(params['id']);
    });
  }

  getStyles(status_id) {
      return {'border-right': '7px solid ' + this.get_status_by_id(status_id).color};
  }

  plan_url(id) {
    let url  = /(.*?)(?=run|$)/.exec(this.location.prepareExternalUrl(this.location.path()))[0];
    url = /(.*?)(?=\d+\/$)/.exec(url)[0] + id;
    return url;
  }

  run_url(id) {
    let url  = /(.*?)(?=case_history|$)/.exec(this.location.prepareExternalUrl(this.location.path()))[0];
    url = /(.*?)(?=\d+\/$)/.exec(url)[0] + id;
    return url;
  }

  suite_url(plan_id, suite_id) {
    let url  = /(.*?)(?=run|$)/.exec(this.location.prepareExternalUrl(this.location.path()))[0];
    url = /(.*?)(?=\d+\/$)/.exec(url)[0] + plan_id + '/suite/' + suite_id;
    return url;
  }

  result_set_url(id) {
    let url  = /(.*?)(?=case_history|$)/.exec(this.location.prepareExternalUrl(this.location.path()))[0];
    url = url + 'result_set/' + id;
    return url;
  }

  init_data(id) {
    this.loading = true;
    Promise.all([this.get_statuses(), this.get_case_history(id)]).then(res => {
      this.statuses = res[0];
    });
  }

  get_case_history(id) {
    this.ApiService.history(id).then(res => {
      this.history = res;
      this.loading = false;
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses().then(res => { return res; });
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id == id);
  }

  async get_results(history) {
    if (this.results_data[history.id] == undefined) {
      history.object_status = 'loading';
      const results = await this.ApiService.results(history.id);
      history.object_status = 'closed';
      this.results_data[history.id] = {results: results};
    }
    history.object_status == 'closed' ? history.object_status = 'opened' : history.object_status = 'closed';
  }

  close_all() {
    console.log('close_all')
  }
  update_click() {}

  log(a) {
    console.log('kkkkk')
    console.log(a)
  }
}
