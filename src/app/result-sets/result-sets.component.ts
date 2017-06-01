import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {ResultSet} from '../models/result_set';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../servises/palladium-api.service';


@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.css']
})
export class ResultSetsComponent implements OnInit {
  run_id = null;
  result_sets: ResultSet[] = [];
  errorMessage;
  constructor(private activatedRoute: ActivatedRoute, private httpService: PalladiumApiService,  private router: Router ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.run_id = params.id;
      // console.log(params.id);
      this.get_result_sets(this.run_id);
    });
  }

  get_result_sets(run_id) {
    this.httpService.postData('/api/result_sets', 'result_set_data[run_id]=' + this.run_id)
      .subscribe(
        responce => {
          return(this.result_sets = responce['result_sets']);
        },
        error =>  this.errorMessage = <any>error);
  }

  delete_result_set(result_set_id, index) {
    this.httpService.postData('/api/result_set_delete', 'result_set_data[id]=' + result_set_id)
      .subscribe(
        result_sets => {
          this.result_sets.splice(index, 1);
          if ( this.router.url.indexOf('/result_set/' + result_sets['result_set']) >= 0) {
            this.router.navigate([/(.*?)(?=result_set|$)/.exec(this.router.url)[0]]);
          }
        },
        error =>  this.errorMessage = <any>error);
  }

  edit_result_set(form: NgForm, id: number, index: number) {
    const params = 'result_set_data[result_set_name]=' + form.value['result_set_name'] + '&result_set_data[id]=' +  id;
    this.httpService.postData('/api/result_set_edit', params)
      .subscribe(
        result_sets => {
          if (Object.keys(result_sets.errors).length === 0) {
            this.result_sets[index].name = result_sets.result_set_data.name;
            this.result_sets[index].updated_at = result_sets.result_set_data.updated_at;
          } else {
            console.log(result_sets.errors);
          }
        },
        error =>  this.errorMessage = <any>error);
  }
}
