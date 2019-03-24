import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
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
  new_result_form = new FormGroup({
    status: new FormControl('', [Validators.required]),
    message: new FormControl('')
  });
  @ViewChild('search_input_element') search_input_element;
  add_result_open = false;
  selected_status;
  result_sets = [];
  statistic: Statistic = new Statistic(null);
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
  filter: any[] = [];
  select_all_flag = false;
  settings = new LocalSettingsService;
  search_data = '';
  scrollPos = 0;
  run_id;
  dropdown_menu_item_select;
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
      return {'border-right': '3px solid ' + this.get_status_by_id(object.status).color};
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
        object: this.dropdown_menu_item_select,
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
    const path = /\S*run\/(\d+)/.exec(this.router.url)[0] + '/case_history/';
    if (this.object.path === 'case') {
      this.router.navigate([path, this.dropdown_menu_item_select.id]);
    } else {
      const case_id = this.get_case_id_by_result_set(this.dropdown_menu_item_select);
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
    this.stat.update_parant_statistic(this.statistic);
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
    this.get_result_sets_and_cases();
    this.select_all_flag = false;
    if (this.ResultComponent) {
      this.ResultComponent.update_click();
    }
  }

  onActivate(componentRef) {
    this.ResultComponent = componentRef;
  }

  clicked(event, object) {
   if (!(event.target.classList.contains('result-set-checkbox') ||
      event.target.classList.contains('mat-checkbox-inner-container') ||
      event.target.classList.contains('menu') ||
      event.target.classList.contains('mat-checkbox'))) {
      this.open_results(object)
    }
  }

  copy_result_set_name() {
    const txtArea = document.createElement('textarea');
    txtArea.id = 'txt';
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = this.dropdown_menu_item_select.name;
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


  get_selected_for_add_result() {
    return this.result_sets_and_cases.filter(x => x.selected);
  }

  selected_result_sets() {
    return this.result_sets_and_cases.filter(obj => obj.path === 'result_set' && obj.selected);
  }

  selected_cases() {
    return this.result_sets_and_cases.filter(obj => obj.path === 'case' && obj.selected);
  }

  get status() {
    return this.new_result_form.get('status').value;
  }

  get message() {
    return this.new_result_form.get('message').value;
  }

  async add_result() {
    const result_sets_result_promise = this.ApiService.result_new(this.selected_result_sets(), this.message, this.status);
    const cases_result_promise = this.ApiService.result_new_by_case(this.selected_cases(), this.message, this.status, this.run_id);
    const result_sets_result = await result_sets_result_promise;
    const cases_result = await cases_result_promise;
    this.update_result_sets(result_sets_result);
    this.update_cases(cases_result);
    this.show_all();
    if (this.object && this.object.selected) {
      this.resultservice.update_results(result_sets_result || cases_result);
    }
    this.update_statistic();
    this.unselect_all();
    this.new_result_form.reset(['name', 'status']);
    this.add_result_open = false;
  }

  update_result_sets(result_sets) {
    if (!result_sets['result_sets']) { return }
    result_sets['result_sets'].forEach(element => {
      const index = this.result_sets_and_cases.findIndex(object => object.name == element.name && object.path == 'result_set');
      this.result_sets_and_cases[index].status = element.status;
    });
  }

  update_cases(cases) {
    if ( !cases['result_sets'] ) { return }
    cases['result_sets'].forEach(element => {
      const new_result_set = new ResultSet(element);
      const index = this.result_sets_and_cases.findIndex(object => object.name == element.name && object.path == 'case');
      if (this.result_sets_and_cases[index].active) {
        new_result_set.active = true;
        this.open_results(new_result_set);
      }
      this.result_sets_and_cases[index] = new_result_set;
    });
  }

  cancel_result_custom() {
    this.selected_status = '';
    this.add_result_open = false;
  }

  add_result_open_menu() {
    const selected = this.result_sets_and_cases.filter(obj => obj.selected);
    this.add_result_open = true;
    if (selected.length == 1) {
      this.new_result_form.patchValue({status: this.get_status_by_id(selected[0].status)});
    } else {
      this.new_result_form.reset('status');
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
