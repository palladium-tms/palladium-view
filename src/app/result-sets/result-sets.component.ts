import {Component, OnInit, AfterViewInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ResultSet} from '../models/result_set';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {HttpService} from '../../services/http-request.service';
import {StatusFilterPipe} from '../pipes/status_filter_pipe/status-filter.pipe';

declare var $: any;

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.css'],
  providers: [PalladiumApiService, StatusFilterPipe]
})
export class ResultSetsComponent implements OnInit, AfterViewInit {
  run_id = null;
  result_sets: ResultSet[] = [];
  errorMessage;
  result_set_settings_data = {};
  statuses;
  statuses_array = [];
  statistic = {};
  selected_counter = [];
  selected_color;
  selected_status_id;
  selected_status_color;
  filter: any[] = [];

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,
              private ApiService: PalladiumApiService, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.result_sets = [];
      this.run_id = params.id;
      this.get_result_sets(this.run_id);
      this.ApiService.get_statuses().then(res => {
        this.statuses = JSON.parse(JSON.stringify(res));
        this.statuses_array = Object.keys(this.statuses);
        this.statuses['0'] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      });
    });
    if (this.router.url.indexOf('/result_set/') >= 0) {
      $('.product-space').removeClass('very-big-column big-column').addClass('small-column');
      $('.plan-space').removeClass('very-big-column big-column').addClass('small-column ');
      $('.run-space').removeClass('very-big-column small-column').addClass('big-column');
    }
  }

  ngAfterViewInit() {
    $('.result_sets_list').css('height', $('#main-container').innerHeight() - 120);
  }

  getStyles(id) {
    if (this.statuses) {
      return {'box-shadow': 'inset 0 0 10px ' + this.statuses[id['status']].color};
    }
  }

  get_result_sets(run_id) {
    this.httpService.postData('/result_sets', 'result_set_data[run_id]=' + this.run_id)
      .then(
        responce => {
          this.calculate_statistic_of_run(responce['result_sets']);
          return (this.result_sets = responce['result_sets']);
        },
        error => this.errorMessage = <any>error);
  }

  delete_result_set(modal) {
    if (confirm('A u shuare?')) {
      this.httpService.postData('/result_set_delete', 'result_set_data[id]=' + this.result_set_settings_data['id'])
        .then(
          result_sets => {
            this.result_sets.splice(this.result_set_settings_data['index'], 1);
            if (this.router.url.indexOf('/result_set/' + result_sets['result_set']) === -1) {
              this.router.navigate([/(.*?)(?=result_set|$)/.exec(this.router.url)[0]]);
            }
          },
          error => this.errorMessage = <any>error);
      modal.close();
    }
  }

  edit_result_set(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    const params = 'result_set_data[result_set_name]=' + form.value['result_set_name']
      + '&result_set_data[id]=' + (this.result_set_settings_data['id'] - 2);
    this.httpService.postData('/result_set_edit', params)
      .then(
        result_sets => {
          if (Object.keys(result_sets.errors).length === 0) {
            this.result_sets[this.result_set_settings_data['index']].name = result_sets.result_set_data.name;
            this.result_sets[this.result_set_settings_data['index']].updated_at = result_sets.result_set_data.updated_at;
          } else {
          }
        },
        error => this.errorMessage = <any>error);
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
      return {'background': this.statuses[id].color};
    }
  }

  calculate_statistic_of_run(data): void { // FIXME: it must be sended from run component, buti dont know how
    this.statistic = {};
    for (const result_set of data) {
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
    } else {
      const index = this.selected_counter.indexOf(result_set.id);
      this.selected_counter.splice(index, 1);
    }
    this.add_result_button(this.selected_counter.length === 0);
  }

  add_result_button(disable: boolean) {
    if (disable) {
      $('.add-result-block').addClass('disabled');
    } else {
      $('.add-result-block').removeClass('disabled');
    }
  }

  add_result_modal(modal) {
    if (this.selected_counter.length !== 0) {
      modal.open();
      if (this.selected_counter.length === 1) {
        this.set_sets_status_as_default();
      } else {
        this.set_first_status_as_default();
      }
    }
  }

  set_sets_status_as_default() {
    const result_set = this.result_sets.find(set => set['id'] + '' === $('input[type=checkbox]:checked').val());
    this.selected_status_id = +result_set['status'];
    this.selected_status_color = this.statuses[result_set['status']]['color'];
    console.log(result_set['status']);
  }

  set_first_status_as_default() {
    this.selected_status_color = this.statuses[this.statuses_array[0]]['color'];
    this.selected_status_id = +this.statuses[this.statuses_array[0]]['id'];
    console.log(this.selected_status_id);
  }

  add_results(form: NgForm, modal) {
    if (form.value['result_status'] === '') {
      form.value['result_status'] = this.selected_color;
    }
    const params = this.set_params_for_add_result({
      description: form.value['result_description'],
      status: this.statuses[form.value['result_status'].toString()], result_sets: this.selected_counter
    });
    this.httpService.postData('/result_new', params)
      .then(
        result_sets => {
          this.result_sets.forEach((current_result_set, index) => {
            if (result_sets['result_set_id'].includes(current_result_set['id'])) {
              this.result_sets[index]['status'] = form.value['result_status'].toString();
              this.calculate_statistic_of_run(this.result_sets);
            }
          });
        },
        error => this.errorMessage = <any>error);
    modal.close();
  }

  set_params_for_add_result(data) {
    var params = '';
    for (const result_set of data['result_sets']) {
      params += 'result_data[result_set_id][]=' + result_set + '&';
    }
    params += 'result_data[message]=' + data['description'] + '&';
    params += 'result_data[status]=' + data['status']['name'];
    return (params);
  }

  changer_header_color() {
    this.header_background_change(this.statuses[$('option:selected').val()]['color']);
  }

  header_background_change(color) {
    $('.status_color').css('background-color', color);
  }

  addfilter(value, self) {
    this.filer_selector(self);
    var index = this.filter.indexOf(value, 0);
    if (index === -1) {
      this.filter.push(value);
    } else {
      this.filter.splice(index, 1);
    }
  }

  filer_selector(element) {
    if ($(element).hasClass('selected')) {
      $(element).removeClass('selected');
    } else {
      $(element).addClass('selected');
    }
  }
}
