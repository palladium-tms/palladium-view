import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {Statistic} from '../models/statistic';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StatusFilterPipe} from '../pipes/status_filter_pipe/status-filter.pipe';
import {StatisticService} from '../../services/statistic.service';
import {ResultService} from '../../services/result.service';
import {LocalSettingsService} from '../../services/local-settings.service';
import {ResultSet} from '../models/result_set';
import {ProductSettingsComponent} from '../products/products.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.scss'],
  providers: [PalladiumApiService, StatusFilterPipe, ResultService]
})

export class ResultSetsComponent implements OnInit {
  @ViewChild('AddResultModal') AddResultModal;
  @ViewChild('form') form;
  @ViewChild('search_input_element') search_input_element;
  add_result_open = false;
  selected_status;
  result_sets = [];
  search_input = false;
  loading = false;
  cases;
  object;
  ResultComponent;
  statuses = [];
  not_blocked_status = [];
  statuses_array = [];
  result_sets_and_cases = [];
  show_all_elements = [];
  statistic: Statistic;
  filter: any[] = [];
  select_all_flag = false;
  settings = new LocalSettingsService;
  search_data = '';
  scrollPos = 0;
  run_id;
  public Math: Math = Math;
  constructor(private activatedRoute: ActivatedRoute, public stat: StatisticService,
              private ApiService: PalladiumApiService, private router: Router,
              private resultservice: ResultService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(() => {
      this.object = null;
      this.get_result_sets_and_cases();
      this.run_id = this.router.url.match(/run\/(\d+)/i)[1];
    });
  }

  get_used_statuses_id() {
    return this.statuses.filter(x => {
      return x.active
    }).map(x => {
      return x.id
    });
  }

  filter_by_status() {
    const statuses_id = this.get_used_statuses_id();
    if (statuses_id.length == 0) {
      return this.result_sets_and_cases
    }
    return this.result_sets_and_cases.filter(x => {
      return statuses_id.includes(x.status)
    });
  }

  filter_by_search(data) {
    if (this.search_data == '') {
      return data;
    }
    return data.filter(item => {
      return item.name.toLowerCase().includes(this.search_data);
    });
  }

  write_to_search($event) {
    this.search_data = $event.target.value.toLowerCase();
    this.show_all()
  }

  show_all() {
    const filtered_by_status = this.filter_by_status();
    this.show_all_elements = this.filter_by_search(filtered_by_status);
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
      this.show_all();
    });
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

  open_settings() {
    const dialogRef = this.dialog.open(ResultSetsSettingsComponent, {
      data: {
        object: this.object,
        cases: this.cases,
        result_sets: this.result_sets,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.path == 'case') {
          this.cases = this.cases.filter(obj => (obj.id !== result.id));
          this.navigate_to_run_show();
        } else {
          this.result_sets = this.result_sets.filter(obj => (obj.id !== result.id));
          this.object = this.cases.find(obj => (obj.name == result.name));
          this.object.active = true;
          this.router.navigate([this.router.url.replace(/\/result_set.*/, '/case/' +  this.object.id)]);
        }
        this.merge_result_sets_and_cases();
        this.update_statistic();
        this.show_all();
      }
    });
  };

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
      res['result_sets'].forEach(result_set => {
        let index;
        index = this.result_sets_and_cases.findIndex(current_object =>
          result_set.name === current_object.name);
        this.result_sets_and_cases[index] = new ResultSet(result_set);
        this.result_sets_and_cases[index].selected = true;
      });
      return res;
    });
  }

  add_result_for_case(message, status) {
    const cases = this.result_sets_and_cases.filter(obj => obj.path === 'case' && obj.selected);
    if (cases.length === 0) {
      return Promise.resolve([]);
    }
    return this.ApiService.result_new_by_case(cases, message, status, this.run_id).then((res: any) => {
      res.forEach(responce_result_set => {
        let index;
        index = this.result_sets_and_cases.findIndex(current_object =>
          responce_result_set.name === current_object.name);
        this.result_sets_and_cases[index] = responce_result_set;
        this.result_sets_and_cases[index].selected = true;
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

  set_filters() {
    this.statuses.forEach(status => {
      if (this.filter.includes(status.id)) {
        status.active = true;
      }
    });
  }

  navigate_to_run_show() {
    this.router.navigate([/\S*run\/(\d+)/.exec(this.router.url)[0]], {relativeTo: this.activatedRoute});
  }

  unselect_all() {
    this.select_all_flag = false;
    this.result_sets_and_cases.forEach(obj => {
      obj.selected = false;
    });
  }

  select() {
    this.show_all_elements.forEach(obj => {
      obj.selected = this.select_all_flag;
    });
  }

  open_history_page() {
    if (this.loading) { return }
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
    if (this.loading) { return }
    this.get_result_sets_and_cases();
    if (this.ResultComponent) {
      this.ResultComponent.update_click();
    }
  }

  onActivate(componentRef) {
    this.ResultComponent = componentRef;
  }

  clicked(event) {
    if (event.target.classList.contains('result_set_link')) {
      const object = this.result_sets_and_cases.filter(obj => obj.id == event.target.dataset.id &&
        obj.path == event.target.dataset.path)[0];
      this.open_results(object)
    }
  }

  copy_result_set_name($event) {
    const txtArea = document.createElement('textarea');
    txtArea.id = 'txt';
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = $event.target.closest('.item').querySelector('.result_set_link').title;
    document.body.appendChild(txtArea);
    txtArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        return true;
      }
    } catch (err) {
    } finally {
      document.body.removeChild(txtArea);
    }
    return false;
  }

  search_open() {
    this.search_data = '';
    this.show_all();
    this.search_input = !this.search_input;
    if (this.search_input) {
      // FIXME
      setTimeout(() => {
        this.search_input_element.nativeElement.focus();
      }, 100);
    }
  }

  colScroll(event) {
    this.scrollPos = Math.floor(event.target.scrollTop / 33);
  }

  select_status($event) {
    this.selected_status = this.statuses.filter(x => {
      return x.id == $event
    })[0]
  }

  get_selected_for_add_result() {
    return this.result_sets_and_cases.filter(x => x.selected);
  }

  add_result_custom(form: NgForm) {
    if (this.selected_status) {
      const description = form.value['result_description'];
      const status = this.selected_status;
      Promise.all([this.add_result_for_result_set(description, status), this.add_result_for_case(description,
        status)]).then(res => {
        this.update_statistic();
        if (/result_set\/(\d+)/.exec(this.router.url) !== null) {
          if (this.add_result_to_selected_result_set(res[0]['result_sets'])) {
            this.resultservice.update_results(res[0]);
          }
        } else if (this.router.url.indexOf('/case_history/') >= 0) {
          // Fixme: Add history updating
        }
        this.show_all();
        this.unselect_all();
      });
      this.selected_status = '';
      this.add_result_open = false;
    }
  }

  cancel_result_custom() {
    this.selected_status = '';
    this.add_result_open = false;
  }

  unselect(object) {
    object.selected = false;
    if (this.get_selected_count() == 0) {
      this.cancel_result_custom()
    }
  }

  add_result_open_menu() {
    if (!this.loading && this.get_selected_count() != 0) {
      this.add_result_open = true;
    }
  }
}

@Component({
  selector: 'app-result-sets',
  templateUrl: 'result-sets.settings.component.html',
  providers: [PalladiumApiService, StatusFilterPipe, ResultService]
})

export class ResultSetsSettingsComponent implements OnInit {
  object;
  cases;
  object_form = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private ApiService: PalladiumApiService, @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.cases = this.data.cases;
    this.object_form.patchValue({name: this.object.name});
  }

  get name() {
    return this.object_form.get('name');
  }

  async edit_object() {
    if (this.object.path === 'result_set') {
      await this.ApiService.edit_case_by_result_set_id(this.object.id, this.name.value);
      const case_for_edit = this.cases.find(current_case => current_case.name == this.object.name);
      case_for_edit.name = this.name.value;
    } else {
      await this.ApiService.edit_case(this.object.id, this.name.value);
    }
    this.object.name = this.name.value;
    this.dialogRef.close();
  }

  async delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object.path === 'result_set') {
        await this.ApiService.delete_result_set(this.object.id);
      } else {
        await this.ApiService.delete_case(this.object.id);
      }
      this.dialogRef.close(this.object);
    }
  }

  name_is_existed() {
    if (this.name_is_not_changed()) {
      return false
    }
    return this.data.cases.some(suite => suite.name == this.name.value)
  }

  name_is_not_changed() {
    return this.object.name == this.name.value;
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.object_form.controls['name'].setErrors({'is_exist': true});
    }
  }
}
