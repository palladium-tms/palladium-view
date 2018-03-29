import {Component, OnInit} from '@angular/core';
import {Result} from '../models/result';
import {Params, Router, ActivatedRoute} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {ResultService} from '../../services/result.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})


export class ResultsComponent implements OnInit {
  results: Result[] = [];
  statuses;
  loading = false;

  constructor(private ApiService: PalladiumApiService, private resultservice: ResultService,
              private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => { this.init_results(); });
    this.resultservice.news().subscribe(data => {
      this.add_result(data['result']);
    });
  }

  add_result(data) {
    this.results.unshift(new Result(data));
  }

  init_results() {
    this.loading = true;
    Promise.all([this.get_statuses(), this.get_results()]).then(res => {
      this.results = res[1];
      this.statuses = res[0];
      this.loading = false;
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses().then(res => { return res; });
  }

  get_results() {
    const result_set_id = this.router.url.match(/result_set\/(\d+)/i)[1];
    return this.ApiService.get_results(result_set_id).then(res => {
      return res;
    }); //FIXME: Dont need to update all.
    // Need only paint new result in list and wait respond 200 in result-set component
  }

  getStyles(id) {
    if (this.statuses) {
      return {'border-right': '7px solid ' +  this.get_status_by_id(id.status_id).color};
    }
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === id);
  }

  update_click() {
    this.init_results();
  }
}
