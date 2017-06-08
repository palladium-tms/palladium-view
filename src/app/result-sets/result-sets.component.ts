import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {ResultSet} from '../models/result_set';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {HttpService} from '../../services/http-request.service';
declare var $: any;

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.css'],
  providers: [PalladiumApiService]
})
export class ResultSetsComponent implements OnInit {
  run_id = null;
  result_sets: ResultSet[] = [];
  errorMessage;
  result_set_settings_data = {};
  statuses;

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,
              private ApiService: PalladiumApiService,  private router: Router ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.run_id = params.id;
      this.get_result_sets(this.run_id);
      this.ApiService.get_statuses().subscribe(res => this.statuses = res);
    });
  }
  getStyles(id) {
    if (this.statuses) {
      return {'box-shadow': 'inset 0 0 10px ' + this.statuses[id].color };
    }
  }
  get_result_sets(run_id) {
    this.httpService.postData('/api/result_sets', 'result_set_data[run_id]=' + this.run_id)
      .subscribe(
        responce => {
          return(this.result_sets = responce['result_sets']);
        },
        error =>  this.errorMessage = <any>error);
  }

  delete_result_set(modal) {
    if (confirm('A u shuare?')) {
      this.httpService.postData('/api/result_set_delete', 'result_set_data[id]=' + this.result_set_settings_data['id'])
      .subscribe(
        result_sets => {
          this.result_sets.splice(this.result_set_settings_data['index'], 1);
          if ( this.router.url.indexOf('/result_set/' + result_sets['result_set']) === -1) {
            this.router.navigate([/(.*?)(?=result_set|$)/.exec(this.router.url)[0]]);
          }
        },
        error =>  this.errorMessage = <any>error);
    modal.close();
    }
  }

  edit_result_set(form: NgForm, modal, valid: boolean) {
    if ( !valid ) { return; }
    const params = 'result_set_data[result_set_name]=' + form.value['result_set_name']
      + '&result_set_data[id]=' +  this.result_set_settings_data['id'];
    this.httpService.postData('/api/result_set_edit', params)
      .subscribe(
        result_sets => {
          if (Object.keys(result_sets.errors).length === 0) {
            this.result_sets[this.result_set_settings_data['index']].name = result_sets.result_set_data.name;
            this.result_sets[this.result_set_settings_data['index']].updated_at = result_sets.result_set_data.updated_at;
          } else {
            console.log(result_sets.errors);
          }
        },
        error =>  this.errorMessage = <any>error);
    modal.close();
  }
  show_settings_button(index) {
    $('#' + index + '.result-set-setting-button').css('display', 'block');
  };
  hide_settings_button(index) {
    $('#' + index + '.result-set-setting-button').css('display', 'none');
  };
  settings(modal, result_set, index, form) {
    this.result_set_settings_data = {id: result_set.id, index: index};
    modal.open();
    form.controls['result_set_name'].setValue(result_set.name);
  }
}
