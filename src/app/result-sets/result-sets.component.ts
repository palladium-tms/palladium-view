import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ResultSet} from '../models/result_set';
import {Case} from '../models/case';
import {Statistic} from '../models/statistic';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {HttpService} from '../../services/http-request.service';
import {StatusFilterPipe} from '../pipes/status_filter_pipe/status-filter.pipe';
import {StatusSelectorComponent} from '../page-component/status-selector/status-selector/status-selector.component';
import {StatusticService} from '../../services/statistic.service';

declare var $: any;

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.css'],
  providers: [PalladiumApiService, StatusFilterPipe]
})

export class ResultSetsComponent implements OnInit, AfterViewInit {
  @ViewChild('Selector')
  private Selector: StatusSelectorComponent;
  run_id = null;
  result_sets: ResultSet[] = [];
  errorMessage;
  result_set_settings_data = {};
  statuses;
  all_statuses;
  statuses_array = [];
  result_sets_and_cases = [];
  statistic: Statistic;
  selected_objects = [];
  selected_status_id = null;
  filter: any[] = [];

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService, public stat: StatusticService,
              private ApiService: PalladiumApiService, private router: Router, private _eref: ElementRef) {
  }

  // FIXME: https://github.com/valor-software/ng2-select/pull/712
  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.result_sets = [];
      this.result_sets_and_cases = [];
      this.run_id = params.id;
      this.get_result_sets(this.run_id);
      this.ApiService.get_not_blocked_statuses().then(res => {
        this.statuses = JSON.parse(JSON.stringify(res));
        this.all_statuses = JSON.parse(JSON.stringify(res));
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

  getStyles(object) {
    if (this.statuses && object['status']) {
      return {'box-shadow': 'inset 0 0 10px ' + this.statuses[object['status']].color};
    }
  }

  get_result_sets(run_id) {
    this.ApiService.get_result_sets(run_id).then(result_sets => {
      this.result_sets = result_sets;
      return result_sets;
    }).then(result_sets => {
        this.get_result_sets_and_cases(run_id, this.router.url.match(/product\/(\d+)/i)[1]);
    });
  }

  delete_result_set(modal) {
    if (this.result_set_settings_data['object'].constructor.name === 'ResultSet') {
      if (confirm('A u shuare?')) {
        this.httpService.postData('/result_set_delete', 'result_set_data[id]=' + this.result_set_settings_data['id'])
          .then(
            result_sets => {
              this.result_sets_and_cases[this.result_set_settings_data['index']] = new Case(this.result_set_settings_data['object']);
              if (this.router.url.indexOf('/result_set/' + result_sets['result_set']) === -1) {
                this.router.navigate([/(.*?)(?=result_set|$)/.exec(this.router.url)[0]]);
              }
              this.update_statistic();
            },
            error => this.errorMessage = <any>error);
        modal.close();
      }
    } else {
      if (confirm('A u shuare?')) {
        this.ApiService.delete_case(this.result_set_settings_data['id']).then(res => {
          this.result_sets_and_cases.splice(this.result_set_settings_data['index'], 1);
          this.update_statistic();
        });
        modal.close();
      }
    }
  }

  edit_result_set(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    this.ApiService.edit_case_by_result_set_id(this.result_set_settings_data['id'], form.value['result_set_name']).then(this_case => {
      const result_set_for_change = this.result_sets.filter(result_set => result_set.id === this.result_set_settings_data['id'])[0];
      result_set_for_change.name = this_case.name;
      result_set_for_change.updated_at = this_case.updated_at;
    });
    modal.close();
  }

  show_settings_button(index) {
    $('#' + index + '.result-set-setting-button').show();
  };

  hide_settings_button(index) {
    $('#' + index + '.result-set-setting-button').hide();
  };

  settings(modal, object, index, form) {
    this.result_set_settings_data = {object: object, id: object.id, index: index};
    modal.open();
    form.controls['result_set_name'].setValue(object.name);
  }

  set_space_width() {
    $('.product-space').removeClass('very-big-column big-column').addClass('small-column');
    $('.plan-space').removeClass('very-big-column big-column').addClass('small-column');
    $('.run-space').removeClass('very-big-column big-column').addClass('big-column');
    $('.result_set-space').removeClass('big-column').addClass('small-column');
    $('.lost-result').hide();
  }

  getStylesBackround(object) {
    if (this.statuses && object['status']) {
      return {'background': this.statuses[object['status']].color};
    }
  }

  selectCounter(event, object) {
    if (event.target.checked) {
      this.selected_objects.push(object);
    } else {
      this.selected_objects = this.selected_objects.filter(obj => obj.id !== object.id);
    }
    this.add_result_button(this.selected_objects.length === 0);
  }

  add_result_button(disable: boolean) {
    if (disable) {
      $('.add-result-block').addClass('disabled');
    } else {
      $('.add-result-block').removeClass('disabled');
    }
  }

  add_result_modal(modal) {
    if (this.selected_objects.length !== 0) {
      modal.open();
      if (this.selected_objects.length === 1) {
        this.set_sets_status_as_default();
      } else {
        this.set_first_status_as_default();
      }
    }
  }

  set_sets_status_as_default() {
    console.log(this.result_sets_and_cases.find(set => set.id + '' === $('input[type=checkbox]:checked').val())['status'])
    this.select_default_status(this.result_sets_and_cases.find(set =>
      set['id'] + '' === $('input[type=checkbox]:checked').val())['status']);
  }

  set_first_status_as_default() {
    this.Selector.clear_selected();
    this.selected_status_id = null;
  }

  add_results(form: NgForm, modal) {
    const description = form.value['result_description'];
    const status_name = this.statuses[this.selected_status_id]['name'];
    Promise.all([this.add_result_for_result_set(description, status_name), this.add_result_for_case(description,
      this.statuses[this.selected_status_id])]).then(res => {
      this.result_sets_and_cases.filter(current_object => this.selected_objects.includes(current_object))
        .forEach((current_result_set) => {
          current_result_set.status = +this.selected_status_id;
        });
      this.update_statistic();
      this.clear_inputs(form.controls['result_description']);
    });
    modal.close();
  }

  add_result_for_result_set(message, status) {
    const result_sets = this.selected_objects.filter(obj => obj.constructor.name === 'ResultSet');
    if (result_sets.length === 0) {
      return Promise.resolve([]);
    }
    return this.ApiService.result_new(result_sets, message, status).then(res => {
      return res;
    });
  }

  add_result_for_case(message, status) {
    const cases = this.selected_objects.filter(obj => obj.constructor.name === 'Case');
    if (cases.length === 0) {
      return Promise.resolve([]);
    }
    return this.ApiService.result_new_by_case(cases, message, status, this.run_id).then(res => {
      res.forEach(responce_result_set => {
        let index;
        index = this.result_sets_and_cases.findIndex(current_object =>
          responce_result_set.name === current_object.name);
        this.result_sets_and_cases[index] = responce_result_set;
      });
    });
  }

  clear_inputs(form) {
    this.Selector.clear_selected();
    this.selected_status_id = null;
    form.setValue(null);
    this.update_statistic();
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

  selected_status_get(selected_id) {
    this.selected_status_id = selected_id;
  }

  select_default_status(id) {
    if (id !== 0) {
      this.Selector.set_status(id);
      this.selected_status_id = id;
    }
  }

  get_result_sets_and_cases(run_id, product_id) {
    const cases = [];
    this.ApiService.get_cases_by_run_id(run_id, product_id).then(all_cases => {
      Object(all_cases).forEach(current_case => {
        if (this.result_sets.filter(result_set => result_set.name === current_case.name).length === 0) {
          cases.push(current_case);
        }
      });
      this.result_sets_and_cases = this.result_sets.concat(cases);
      this.update_statistic();
    });
  }

  update_statistic() {
    const stat_data = {};
    this.result_sets_and_cases.forEach(object => {
      if (object['status'] in stat_data) {
        stat_data[object['status']] += 1;
      } else {
        stat_data[object['status']] = 1;
      }
    });
    this.statistic = new Statistic(stat_data);
    this.stat.update_run_statistic(this.statistic);
  }
}
