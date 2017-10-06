import {Component, OnInit} from '@angular/core';
import {Result} from '../models/result';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  results: Result[] = [];
  statuses;

  constructor(private ApiService: PalladiumApiService, private router: Router) {}

  ngOnInit() {
    this.results = [];
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
    });
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
