import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Statistic} from '../models/statistic';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {HttpService} from '../../services/http-request.service';
import {StatusFilterPipe} from '../pipes/status_filter_pipe/status-filter.pipe';
import {StatusSelectorComponent} from '../page-component/status-selector/status-selector.component';
import {StatisticService} from '../../services/statistic.service';
import {ResultService} from '../../services/result.service';

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.css'],
  providers: [PalladiumApiService, StatusFilterPipe, ResultService]
})

export class ResultSetsComponent implements OnInit {
  @ViewChild('Selector')
  @ViewChild('Modal') Modal;
  @ViewChild('AddResultModal') AddResultModal;
  @ViewChild('form') form;
  private Selector: StatusSelectorComponent;
  result_sets = [];
  cases;
  errorMessage;
  object;
  statuses;
  all_statuses;
  not_blocked_status = [];
  statuses_array = [];
  result_sets_and_cases = [];
  statistic: Statistic;
  selected_objects = [];
  selected_status_id = null;
  filter: any[] = [];

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService, public stat: StatisticService,
              private ApiService: PalladiumApiService, private router: Router, private resultservice: ResultService) {
  }

  // FIXME: https://github.com/valor-software/ng2-select/pull/712
  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.selected_objects = [];
      this.get_result_sets_and_cases();
      this.set_default_filter();
      this.ApiService.get_statuses().then(res => {
        this.statuses = JSON.parse(JSON.stringify(res));
        this.all_statuses = JSON.parse(JSON.stringify(res));
        Object.keys(this.statuses).forEach(status => {
          if (!this.all_statuses[status].block) {
            this.not_blocked_status.push(status);
          }
        });
        this.statuses_array = Object.keys(this.statuses);
        this.statuses['0'] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      });
    });
  }

  set_default_filter() {
    const params = this.get_query_filters();
    params.forEach(f => {
      this.filter.push(+f);
    });
  }

  get_query_filters() {
    let filters = [];
    const params = this.activatedRoute.snapshot.queryParams;
    if (Object.keys(params).indexOf('filter') !== -1) {
      if (!(params['filter'] instanceof Array)) {
        filters = [params['filter']];
      } else {
        filters = params['filter'];
      }
    }
    return filters;
  }

  getStyles(object) {
    if (this.statuses && object['status']) {
      return {'border-right': '7px solid ' + this.statuses[object['status']].color};
    }
  }

  get_result_sets() {
    const run_id = this.router.url.match(/run\/(\d+)/i)[1];
    return this.ApiService.get_result_sets(run_id).then(result_sets => {
      return result_sets;
    });
  }

  get_cases() {
    const run_id = this.router.url.match(/run\/(\d+)/i)[1];
    const product_id = this.router.url.match(/product\/(\d+)/i)[1];
    return this.ApiService.get_cases_by_run_id(run_id, product_id).then(all_cases => {
      return all_cases;
    });
  }

  get_result_sets_and_cases() {
    this.selected_objects = [];
    this.result_sets = [];
    this.result_sets_and_cases = [];
    Promise.all([this.get_result_sets(), this.get_cases()]).then(res => {
      this.result_sets = res[0];
      this.cases = res[1];
      const cases = [];
      Object(res[1]).forEach(current_case => {
        if (res[0].filter(result_set => result_set.name === current_case.name).length === 0) {
          cases.push(current_case);
        }
      });
      this.result_sets_and_cases = res[0].concat(cases);
      this.update_statistic();
    });
  }

  delete_object(object) {
    if (confirm('A u shuare?')) {
      if (object.dataContext.path === 'result_set') {
        this.httpService.postData('/result_set_delete',
          'result_set_data[id]=' + object.dataContext.id) // FIXME: move to palladium api service
          .then(
            result_sets => {
              this.result_sets = this.result_sets.filter(obj => (obj.id !== +result_sets['result_set']['id']));
              this.merge_result_sets_and_cases();
              this.update_statistic();
            },
            error => this.errorMessage = <any>error);
      } else {
        this.ApiService.delete_case(object.dataContext.id).then(res => {
          this.cases = this.cases.filter(obj => (obj.id !== res.id));
          this.merge_result_sets_and_cases();
          this.update_statistic();
        });
      }
    }
  }

  merge_result_sets_and_cases() {
    this.result_sets_and_cases = [];
    this.cases.forEach(current_case => {
      if (this.result_sets.filter(result_set => result_set.name === current_case.name).length === 0) {
        this.result_sets_and_cases.push(current_case);
      }
    });
    this.result_sets_and_cases = this.result_sets.concat(this.result_sets_and_cases);
  }

  edit_object(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    if (this.object.path === 'result_set') {
      this.ApiService.edit_case_by_result_set_id(this.object.id, form.value['name']).then(this_case => {
        const result_set_for_change = this.result_sets.filter(result_set => result_set.id === this.object.id)[0];
        result_set_for_change.name = this_case.name;
        result_set_for_change.updated_at = this_case.updated_at;
      });
    } else {
      this.ApiService.edit_case(this.object.id, form.value['name']).then(this_case => {
        const result_set_for_change = this.cases.filter(result_set => result_set.id === this.object.id)[0];
        result_set_for_change.name = this_case.name;
        result_set_for_change.updated_at = this_case.updated_at;
      });
    }
    modal.close();
  }

  add_result_modal() {
    this.AddResultModal.open();
  }

  add_results(form: NgForm, modal) {
    const description = form.value['result_description'];
    const status = this.statuses[form.value['result_status']];
    Promise.all([this.add_result_for_result_set(description, status), this.add_result_for_case(description,
      status)]).then(res => {
      this.result_sets_and_cases.filter(current_object => this.selected_objects.includes(current_object))
        .forEach((current_result_set) => {
          current_result_set.status = +this.selected_status_id;
        });
      this.update_statistic();
      if (this.router.url.indexOf('/result_set/') >= 0) {
        this.resultservice.update_results();
      } else if (this.router.url.indexOf('/case_history/') >= 0) {
        // Fixme: Add history updating
      }
    });
    modal.close();
  }

  add_result_for_result_set(message, status) {
    const result_sets = this.result_sets_and_cases.filter(obj => obj.path === 'result_set' && obj.selected);
    if (result_sets.length === 0) {
      return Promise.resolve([]);
    }
    return this.ApiService.result_new(result_sets, message, status).then(res => {
      this.result_sets_and_cases.filter(obj => obj.path === 'result_set').forEach(obj => {
        if (res['other_data']['result_set_id'].includes(obj.id)) {
          obj.status = res['result']['status_id'];
        }
      });
      return res;
    });
  }

  add_result_for_case(message, status) {
    const run_id = this.router.url.match(/run\/(\d+)/i)[1];
    const cases = this.result_sets_and_cases.filter(obj => obj.path === 'case' && obj.selected);
    if (cases.length === 0) {
      return Promise.resolve([]);
    }
    return this.ApiService.result_new_by_case(cases, message, status, run_id).then(res => {
      res.forEach(responce_result_set => {
        let index;
        index = this.result_sets_and_cases.findIndex(current_object =>
          responce_result_set.name === current_object.name);
        this.result_sets_and_cases[index] = responce_result_set;
      });
    });
  }

  get_filters(e) {
    this.unselect_all();
    this.selected_objects = [];
    this.filter = e;
    this.check_selected_is_hidden(e);
  }

  unselect_all() {
    this.result_sets_and_cases.forEach(obj => {
      obj.selected = false;
    });
  }

  select_all() { // FIXME: need optimize
    if (this.filter.length === 0) {
      this.result_sets_and_cases.forEach(obj => {
        obj.selected = true;
      });
    } else {
      this.result_sets_and_cases.filter(item => this.filter.indexOf(item.status) > -1).forEach(obj => {
        obj.selected = true;
      });
    }
  }

  open_history_page(data) {
    const path = this.get_path();
    if (data['dataContext']['path'] === 'case') {
      this.router.navigate([path + '/case_history/',  data['dataContext']['id']]);
    } else {
      this.router.navigate([path + 'case_history/', this.get_case_id(data['dataContext']['name'])]);
    }
  }

  get_case_id(data) {
    return this.cases.filter(this_case => this_case.name === data)[0].id;
  }

  get_path() {
    if (this.router.url.match(/case_history\/(\d+)/i) !== null) {
      return /(.*?)(?=case_history|$)/.exec(this.router.url)[0];
    } else if (this.router.url.match(/result_set\/(\d+)/i) !== null) {
      return /(.*?)(?=result_set|$)/.exec(this.router.url)[0];
    } else {
      return this.router.url + '/';
    }
  }

  check_selected_is_hidden(filters) {
    if (this.router.url.indexOf('/result_set/') >= 0) {
      this.result_set_selected(filters);
    }
  }

  result_set_selected(filters) {
    const id = this.router.url.match(/result_set\/(\d+)/i)[1];
    const object = this.result_sets_and_cases.filter(obj => obj.id === +id)[0];
    if (filters.length === 0) {
      return;
    }
    if (filters.indexOf(object.status) === -1) {
      this.router.navigate([/(.*?)(?=result_set|$)/.exec(this.router.url)[0]]);
    }
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

  open_modal(object) {
    this.object = this.result_sets_and_cases.filter(obj => obj.id === object.dataContext.id && obj.path === object.dataContext.path)[0];
    this.form.controls['name'].setValue(this.object.name);
    this.Modal.open();
  };

  context_menu(event, object) {
    this.select_object(object);
    if (this.get_selected_count() !== 0) {
      event.open([
        {
          label: '<span class="menu-icon">Add result (' + this.get_selected_count() + ')</span>',
          onClick: this.add_result_modal.bind(this)
        },
        {label: '<span class="menu-icon">Refresh</span>', onClick: this.get_result_sets_and_cases.bind(this)},
        {label: '<span class="menu-icon">Select all</span>', onClick: this.select_all.bind(this)},
        {label: '<span class="menu-icon">History</span>', onClick: this.open_history_page.bind(this)},
        {label: '<span class="menu-icon">Edit</span>', onClick: this.open_modal.bind(this)},
        {label: '<span class="menu-icon">Delete</span>', onClick: this.delete_object.bind(this)}]);
    } else {
      event.open([
        {label: '<span class="menu-icon">Add result</span>', onClick: this.add_result_modal.bind(this)},
        {label: '<span class="menu-icon">Refresh</span>', onClick: this.get_result_sets_and_cases.bind(this)},
        {label: '<span class="menu-icon">History</span>', onClick: this.open_history_page.bind(this)},
        {label: '<span class="menu-icon">Edit</span>', onClick: this.open_modal.bind(this)},
        {label: '<span class="menu-icon">Delete</span>', onClick: this.delete_object.bind(this)}]);
    }
  }

  select_object(object) {
    if (!object.selected) {
      this.unselect_all();
      object.selected = true;
    }
  }

  get_selected_count() {
    return this.result_sets_and_cases.filter(obj => obj.selected).length;
  }
}
