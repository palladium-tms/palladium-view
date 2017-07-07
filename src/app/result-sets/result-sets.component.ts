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
  statuses_array = [];
  statistic = {};
  selected_counter = [];
  selected_color;
  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,
              private ApiService: PalladiumApiService,  private router: Router ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.result_sets = [];
      this.run_id = params.id;
      this.get_result_sets(this.run_id);
      this.ApiService.get_statuses().subscribe(res => {
        this.statuses = res;
        this.statuses_array = Object.keys(this.statuses);
      });
    });
    if ( this.router.url.indexOf('/result_set/') >= 0) {
      $('.product-space').removeClass('very-big-column big-column').addClass('small-column');
      $('.plan-space').removeClass('very-big-column big-column').addClass('small-column ');
      $('.run-space').removeClass('very-big-column small-column').addClass('big-column');
    }
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
          this.calculate_statistic_of_run(responce['result_sets']);
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
          }
        },
        error =>  this.errorMessage = <any>error);
    modal.close();
  }
  show_settings_button(index) {
    $('#' + index + '.result-set-setting-button').show();
  };
  hide_settings_button(index) {
    $('#' + index + '.result-set-setting-button').hide();
  };
  settings(modal, result_set, index, form) {
    this.result_set_settings_data = {id: result_set.id, index: index};
    modal.open();
    form.controls['result_set_name'].setValue(result_set.name);
  }
  set_space_width() {
    $('.product-space').removeClass('very-big-column big-column').addClass('small-column');
    $('.plan-space').removeClass('very-big-column big-column').addClass('small-column');
    $('.run-space').removeClass('very-big-column big-column').addClass('big-column');
    $('.result_set-space').removeClass('big-column').addClass('small-column');
    $('.lost-result').hide();
  }
  getStylesBackround(id) {
    if (this.statuses) {
      return {'background': this.statuses[id].color };
    }
  }
  calculate_statistic_of_run(data): void { // FIXME: it must be sended from run component, buti dont know how
    this.statistic = {};
    for (const result_set of data ) {
      if (result_set['status'] in this.statistic) {
        this.statistic[result_set['status']] += 1;
      } else {
        this.statistic[result_set['status']] = 1;
      }
    }
    this.statistic['all'] = Object.keys(this.statistic);
}
  selectCounter(result_set) {
    if (this.selected_counter.indexOf(result_set.id) === -1) {
      this.selected_counter.push(result_set.id);
    }else {
      const index =  this.selected_counter.indexOf(result_set.id);
      this.selected_counter.splice(index, 1);
    }
    this.add_result_button(this.selected_counter.length === 0);
  }
  add_result_button(disable: boolean) {
    if (disable) {
      $('.add-result-block').addClass('disabled');
    }else {
      $('.add-result-block').removeClass('disabled');
    }
  }
  add_result_modal(modal) {
    if (this.selected_counter.length !== 0 ) {
      modal.open();
      if (this.selected_counter.length === 1 ) {
        this.set_sets_status_as_default();
      }else {
        this.set_first_status_as_default();
      }
    }
  }
  set_sets_status_as_default() {
    var current_result_set;
    $('input[type=checkbox]:checked').val();
    this.result_sets.forEach((current_result_set) => { // FIXME: need to get result_sets like a hash. Need server side changes
      if (+$('input[type=checkbox]:checked').val() === current_result_set['id']) {
        this.selected_color = +this.statuses[current_result_set['status']]['id'];
        this.header_background_change(this.statuses[current_result_set['status']]['color']);
      }
    });
  }
  set_first_status_as_default() {
    this.selected_color = +this.statuses[this.statuses_array[0]]['id'];
    this.header_background_change(this.statuses[this.statuses_array[0]]['color']);
  }
  add_results(form: NgForm, modal) {
    const params = this.set_params_for_add_result({description: form.value['result_description'],
      status: this.statuses[this.statuses_array[form.value['result_status'] - 1]], result_sets: this.selected_counter});
    this.httpService.postData('/api/result_new', params)
      .subscribe(
        result_sets => {
          this.result_sets.forEach((current_result_set, index) => {
            if (result_sets['result_set_id'].includes(current_result_set['id'])) {
              this.result_sets[index]['status'] = this.statuses_array[form.value['result_status'] - 1];
              this.calculate_statistic_of_run(this.result_sets);
            }
          });
        },
        error =>  this.errorMessage = <any>error);
    modal.close();
  }
  set_params_for_add_result(data) {
    var params = '';
    for (const result_set of data['result_sets']) {
      params += 'result_data[result_set_id][]=' + result_set + '&';
    }
    params += 'result_data[message]=' + data['description'] + '&';
    params += 'result_data[status]=' + data['status']['name'];
    return(params);
  }
  changer_header_color() {
    this.header_background_change(this.statuses[$('option:selected').val()]['color']);
  }
  header_background_change(color) {
    $('.status_color').css('background-color', color);
  }
}
