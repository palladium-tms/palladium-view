import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import { Location } from '@angular/common';
import {StatisticService} from '../../services/statistic.service';

@Component({
  selector: 'app-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.css']
})
export class CaseHistoryComponent implements OnInit {
  history;
  statuses;
  constructor( private activatedRoute: ActivatedRoute, private location: Location,
               private ApiService: PalladiumApiService, public StatisticService: StatisticService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.init_data(params['id']);
    });
  }

  getStyles(status) {
    return {'border-right': '7px solid ' + this.statuses[status]['color']};
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

  result_set_url(id) {
    let url  = /(.*?)(?=case_history|$)/.exec(this.location.prepareExternalUrl(this.location.path()))[0];
    url = url + 'result_set/' + id;
    return url;
  }

  init_data(id) {
    Promise.all([this.get_statuses(), this.get_case_history(id)]).then(res => {
      this.statuses = res[0];
    });
  }

  get_case_history(id) {
    this.ApiService.get_history(id).then(res => {
      this.history = res;
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses().then(res => { return res; });
  }
}
