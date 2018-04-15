import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Statistic} from '../models/statistic';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StatusFilterPipe} from '../pipes/status_filter_pipe/status-filter.pipe';
import {StatisticService} from '../../services/statistic.service';
import {ResultService} from '../../services/result.service';
import {Case} from '../models/case';
import {LocalSettingsService} from '../../services/local-settings.service';

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.css'],
  providers: [PalladiumApiService, StatusFilterPipe, ResultService]
})

export class ResultSetsComponent implements OnInit {
  @ViewChild('Modal') Modal;
  @ViewChild('AddResultModal') AddResultModal;
  @ViewChild('form') form;
  result_sets = [];
  loading = false;
  cases;
  object;
  ResultComponent;
  statuses;
  not_blocked_status = [];
  statuses_array = [];
  result_sets_and_cases = [];
  statistic: Statistic;
  filter: any[] = [];
  select_all_flag = false;
  settings = new LocalSettingsService;

  constructor(private activatedRoute: ActivatedRoute, public stat: StatisticService,
              private ApiService: PalladiumApiService, private router: Router, private resultservice: ResultService) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(() => {
      this.object = null;
      this.get_result_sets_and_cases();
    });
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === id);
  }

  get_statuses() {
    this.ApiService.get_statuses().then(res => {
      this.statuses = res;
      this.not_blocked_status = this.statuses.filter(status => status.block === false);
      this.statuses_array = Object.keys(this.statuses);
    });
  }

  getStyles(object) {
    if (this.statuses && object['status']) {
      return {'border-right': '7px solid ' + this.get_status_by_id(object.status).color};
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
    this.result_sets = [];
    this.statuses = null;
    this.statistic = new Statistic(null);
    this.result_sets_and_cases = [];
    this.loading = true;
    Promise.all([this.get_result_sets(), this.get_cases(), this.get_statuses()]).then(res => {
      this.result_sets = res[0];
      this.cases = res[1];
      const cases = [];
      Object(res[1]).forEach(current_case => {
        if (res[0].filter(result_set => result_set.name === current_case.name).length === 0) {
          cases.push(current_case);
        }
      });
      this.result_sets_and_cases = res[0].concat(cases);
      this.select_object();
      this.update_statistic();
      this.loading = false;
      if (this.statuses) {
        this.set_filters();
      }
    });
  }

  delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object.path === 'result_set') {
        this.ApiService.delete_result_set(this.object.id).then(deleted_id => {
          this.result_sets = this.result_sets.filter(obj => (obj.id !== +deleted_id));
          this.merge_result_sets_and_cases();
          this.update_statistic();
          this.Modal.close();
          this.object = this.result_sets_and_cases.find(obj => obj.name === this.object.name && obj.path === 'case');
          if (this.filter.includes(0) || this.filter.length === 0) {
            this.navigate_it_to_case();
          } else {
            this.navigate_to_run_show();
          }
        });
      } else {
        this.ApiService.delete_case(this.object.id).then((this_case: Case) => {
          this.cases = this.cases.filter(obj => (obj.id !== this_case.id));
          this.merge_result_sets_and_cases();
          this.update_statistic();
          this.Modal.close();
          this.object = null;
          this.router.navigate([/\S*run\/(\d+)/.exec(this.router.url)[0]], {relativeTo: this.activatedRoute});
        });
      }
    }
  }

  inaccurately_delete(object) {
    this.object = object;
    if (object.path === 'result_set') {
      this.ApiService.delete_result_set(object.id).then(deleted_id => {
        this.result_sets = this.result_sets.filter(obj => (obj.id !== +deleted_id));
        this.merge_result_sets_and_cases();
        this.update_statistic();
        this.object = this.result_sets_and_cases.find(obj => obj.name === this.object.name && obj.path === 'case');
        this.navigate_to_run_show();
      });
    } else {
      this.ApiService.delete_case(this.object.id).then((this_case: Case) => {
        this.cases = this.cases.filter(obj => (obj.id !== this_case.id));
        this.merge_result_sets_and_cases();
        this.update_statistic();
        this.Modal.close();
        this.object = null;
        this.router.navigate([/\S*run\/(\d+)/.exec(this.router.url)[0]], {relativeTo: this.activatedRoute});
      });
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

  edit_object(form: NgForm, valid: boolean) {
    if (!valid) {
      return;
    }
    if (this.object.path === 'result_set') {
      this.ApiService.edit_case_by_result_set_id(this.object.id, form.value['name']).then(this_case => {
        const result_set_for_change = this.result_sets.filter(result_set => result_set.id === this.object.id)[0];
        result_set_for_change.name = this_case.name;
        result_set_for_change.updated_at = this_case.updated_at;
        const case_for_change = this.cases.filter(case_obj => case_obj.id === this_case.id)[0];
        case_for_change.name = this_case.name;
        case_for_change.updated_at = this_case.updated_at;
      });
    } else {
      this.ApiService.edit_case(this.object.id, form.value['name']).then(this_case => {
        const result_set_for_change = this.cases.filter(result_set => result_set.id === this.object.id)[0];
        result_set_for_change.name = this_case.name;
        result_set_for_change.updated_at = this_case.updated_at;
      });
    }
    this.Modal.close();
  }

  add_result_modal() {
    if (this.loading) {return}
    if (this.get_selected_count() !== 0) {
      this.AddResultModal.open();
    }
  }

  add_results(form: NgForm, modal) {
    const description = form.value['result_description'];
    let status = form.value['result_status'];
    if (status == null) {
      status = this.not_blocked_status[0]
    }
    Promise.all([this.add_result_for_result_set(description, status), this.add_result_for_case(description,
      status)]).then(res => {
      this.update_statistic();
      this.unselect_all();
      if (/result_set\/(\d+)/.exec(this.router.url) !== null) {
        if (this.add_result_to_selected_result_set(res[0]['result_sets'])) {
          this.resultservice.update_results(res[0]);
        }
      } else if (this.router.url.indexOf('/case_history/') >= 0) {
        // Fixme: Add history updating
      }
    });
    this.reset_form(form);
    modal.close();
  }

  add_result_to_selected_result_set(results) {
    const filtered_list = results.filter(result => result['id'] === +/result_set\/(\d+)/.exec(this.router.url)[1]);
    return filtered_list.length === 1;
  }

  add_result_for_result_set(message, status) {
    const result_sets = this.result_sets_and_cases.filter(obj => obj.path === 'result_set' && obj.selected);
    if (result_sets.length === 0) {
      return Promise.resolve([]);
    }
    return this.ApiService.result_new(result_sets, message, status).then(res => {
      this.result_sets_and_cases.filter(obj => obj.path === 'result_set').forEach(obj => {
        const result_sets_array = res['result_sets'].map(result_set => result_set['id']);
        if (result_sets_array.includes(obj.id)) {
          obj.status = res['result'].status_id;
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
    return this.ApiService.result_new_by_case(cases, message, status, run_id).then((res: any) => {
      res.forEach(responce_result_set => {
        let index;
        index = this.result_sets_and_cases.findIndex(current_object =>
          responce_result_set.name === current_object.name);
        this.result_sets_and_cases[index] = responce_result_set;
        this.result_sets_and_cases[index].selected = true;
        this.result_sets.push(responce_result_set);
      });
      this.navigate_if_case_has_opened();
    });
  }

  navigate_if_case_has_opened() {
    if (this.router.url.indexOf('/case/') >= 0) {
      this.reset_active();
      this.open_results(this.result_sets_and_cases.filter(obj => obj.name === this.object.name)[0]);
    }
  }

  // take this.object.name and find case with this name.
  // method will navigate to case page
  navigate_it_to_case() {
    this.open_results(this.result_sets_and_cases.filter(obj => obj.name === this.object.name)[0]);
  }

  get_filters(e) {
    this.filter = [];
    this.unselect_all();
    this.statuses = e;
    this.statuses.forEach(status => {
      if (status.active) {
        this.filter.push(status.id);
      }
    });
    this.unfilter_if_list_empty();
  }

  set_filters() {
    this.statuses.forEach(status => {
      if (this.filter.includes(status.id)) {
        status.active = true;
      }
    });
  }

  navigate_to_run_show() {
    // const result_object = this.result_sets_and_cases.find(obj => obj.id === this.object.id && obj.path === this.object.path);

    this.result_sets_and_cases.find(obj => obj.id === this.object.id && obj.path === this.object.path).active = false;
    this.object = null;
    this.router.navigate([/\S*run\/(\d+)/.exec(this.router.url)[0]], {relativeTo: this.activatedRoute});
  }

  unfilter_if_list_empty() {
    if (!this.statistic.has_statuses(this.filter)) {
      this.filter = [];
    }
  }

  unselect_all() {
    if (this.loading) {return}
    this.result_sets_and_cases.forEach(obj => {
      obj.selected = false;
    });
    this.select_all_flag = false;
  }

  select_all() { // FIXME: need optimize
    if (this.loading) {return}
    if (this.filter.length === 0) {
      this.result_sets_and_cases.forEach(obj => {
        obj.selected = true;
      });
    } else {
      this.result_sets_and_cases.filter(item => this.filter.indexOf(item.status) > -1).forEach(obj => {
        obj.selected = true;
      });
    }
    this.select_all_flag = true;
  }

  open_history_page() {
    if (this.loading) {return}
    const path = /\S*run\/(\d+)/.exec(this.router.url)[0] + '/case_history/';
    if (this.object.path === 'case') {
      this.router.navigate([path, this.object.id]);
    } else {
      const case_id = this.get_case_id_by_result_set(this.object);
      this.router.navigate([path, case_id]);
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

  open_modal() {
    if (this.loading) {return}
    this.form.controls['name'].setValue(this.object.name);
    this.Modal.open();
  };

  get_case_id_by_result_set(result_set) {
    return this.cases.filter(obj => obj.name === result_set.name)[0].id;
  }

  open_results(object) {
    this.reset_active();
    object.active = true;
    this.object = object;
    if (object.path === 'result_set') {
      this.router.navigate(['result_set', object.id], {relativeTo: this.activatedRoute});
    } else {
      this.router.navigate(['case', object.id], {relativeTo: this.activatedRoute});
    }
  }

  reset_active() {
    const active_element = this.result_sets_and_cases.filter(obj => obj.active);
    if (active_element.length !== 0) {
      active_element[0].active = false;
    }
  }

  select_object() {
    if (/result_set\/(\d+)/.exec(this.router.url) !== null) {
      const id = +/result_set\/(\d+)/.exec(this.router.url)[1];
      this.object = this.result_sets_and_cases.filter(obj => obj.id === id && obj.path === 'result_set')[0];
      this.object.active = true;
    } else if (/case\/(\d+)/.exec(this.router.url) !== null) {
      const id = +/case\/(\d+)/.exec(this.router.url)[1];
      this.object = this.result_sets_and_cases.filter(obj => obj.id === id && obj.path === 'case')[0];
      this.object.active = true;
    } else if (/case_history\/(\d+)/.exec(this.router.url) !== null) {
      const id = +/case_history\/(\d+)/.exec(this.router.url)[1];
      const this_case = this.cases.filter(object => object.id === id)[0];
      this.object = this.result_sets_and_cases.filter(obj => obj.name === this_case.name)[0];
      this.object.active = true;
    }
  }

  get_selected_count() {
    return this.result_sets_and_cases.filter(obj => obj.selected).length;
  }

  update_click() {
    if (this.loading) {return}
    this.get_result_sets_and_cases();
    if (this.ResultComponent) {
      this.ResultComponent.update_click();
    }
  }

  onActivate(componentRef) {
    this.ResultComponent = componentRef;
  }

  reset_form(form) {
    form.reset();
  }
}
