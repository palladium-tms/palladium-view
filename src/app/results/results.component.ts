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

  constructor(private ApiService: PalladiumApiService, private resultservice: ResultService,
              private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => { this.init_results(); });
    this.resultservice.news().subscribe(data => { this.init_results(); });
  }

  init_results() {
    Promise.all([this.get_statuses(), this.get_results()]).then(res => {
      this.results = res[1];
      this.statuses = res[0];
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

  getStylesShadow(id) {
    if (this.statuses) {
      return {'box-shadow': '0 0 10px ' + this.statuses[id].color};
    }
  }

  getStylesBackround(id) {
    if (this.statuses) {
      return {'background': this.statuses[id].color};
    }
  }
}
