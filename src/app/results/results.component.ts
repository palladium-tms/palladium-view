import { Component, OnInit } from '@angular/core';
import {Result} from '../models/result';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpService} from '../../services/http-request.service';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  result_set_id = null;
  results: Result[] = [];
  errorMessage;
  statuses;
  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private httpService: HttpService,  private router: Router ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.result_set_id = params.id;
      this.get_results(this.result_set_id);
      this.ApiService.get_statuses().subscribe(res => this.statuses = res);
    });
  }

  get_results(result_set_id) {
    this.httpService.postData('/api/results', 'result_data[result_set_id]=' + this.result_set_id)
      .subscribe(
        responce => {
          return(this.results = responce['results']);
        },
        error =>  this.errorMessage = <any>error);
  }
  getStylesShadow(id) {
    if (this.statuses) {
      return {'box-shadow': '0 0 10px ' + this.statuses[id].color };
    }
  }
  getStylesBackround(id) {
    if (this.statuses) {
      return {'background': this.statuses[id].color };
    }
  }
}
