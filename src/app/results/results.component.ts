import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Result} from '../models/result';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../servises/palladium-api.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  result_set_id = null;
  results: Result[] = [];
  errorMessage;
  constructor(private activatedRoute: ActivatedRoute, private httpService: PalladiumApiService,  private router: Router ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.result_set_id = params.id;
      this.get_results(this.result_set_id);
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

}
