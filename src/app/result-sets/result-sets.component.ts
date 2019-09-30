import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Point, Statistic} from '../models/statistic';
import {ActivatedRoute, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {StanceService} from '../../services/stance.service';
import {ResultService} from '../../services/result.service';
import {ProductSettingsComponent} from '../products/products.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {SearchPipe} from '../pipes/search/search.pipe';
import {StatusFilterPipe} from '../pipes/status_filter_pipe/status-filter.pipe';

export interface SearchToggle {
  toggle: boolean;
  color: 'none' | 'accent';
}

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.scss'],
  providers: [ResultService, SearchPipe, StatusFilterPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultSetsComponent implements OnInit, OnDestroy {
  newResultForm = new FormGroup({
    status: new FormControl('', [Validators.required]),
    message: new FormControl('')
  });
  loading = true;
  addResultOpen = false;
  resultSets = [];
  statistic: Statistic;
  untestedPoint: Point;
  cases;
  object;
  resultComponent;
  statuses;
  notBlockedStatus = [];
  resultSetsAndCases = [];
  filter: number[] = [];
  selectAllFlag = false;
  dropdownMenuItemSelect;
  params;
  searchToggle: SearchToggle;
  searchValue;

  constructor(private activatedRoute: ActivatedRoute, public stat: StatisticService, private stance: StanceService,
              private palladiumApiService: PalladiumApiService, private router: Router,
              private resultservice: ResultService, private dialog: MatDialog, private cd: ChangeDetectorRef,
              private searchPipe: SearchPipe, private statusPipe: StatusFilterPipe) {
    this.searchToggle = { 'toggle': false, 'color': 'none'};
  }

  ngOnInit() {
    this.params = this.activatedRoute.params.subscribe(() => {
      this.object = null;
      this.searchValue = '';
      this.filter = [];
      this.get_result_sets_and_cases();
    });

    this.palladiumApiService.statusObservable.subscribe(() => {
      this.statuses = Object.values(this.palladiumApiService.statuses);
      this.notBlockedStatus = this.statuses.filter(status => !status.block);
      this.cd.detectChanges();
    });
  }

  select_filter(point) {
    this.filter = [];
    point.active = !point.active;
    this.filter = Object.values(this.statistic.points).filter(elem => elem.active).map(elem => elem.status);
    if (this.untestedPoint.active) {
      this.filter.push(0);
    }
    // this.show_all();
  }

  get_cases() {
    return this.palladiumApiService.get_cases_by_run_id(this.stance.runId(), this.stance.productId()).then(allCases => {
      return allCases;
    });
  }

  async get_result_sets_and_cases() {
    this.resultSetsAndCases = [];
    this.loading = true;
    this.cd.detectChanges();
    Promise.all([this.get_cases(), this.palladiumApiService.get_result_sets(this.stance.runId())]).then(res => {
      this.cases = res[0];
      this.merge_result_sets_and_cases();
      this.select_object();
      this.get_statistic();
      this.loading = false;
      if (this.statuses) {
        this.set_filters();
      }
      this.cd.detectChanges();
    });
  }

  merge_result_sets_and_cases() {
    this.resultSetsAndCases = [];
    this.cases.forEach(currentCase => {
      if (this.palladiumApiService.resultSets[this.stance.runId()].filter(resultSet => resultSet.name === currentCase.name).length === 0) {
        this.resultSetsAndCases.push(currentCase);
      }
    });
    this.resultSetsAndCases = this.palladiumApiService.resultSets[this.stance.runId()].concat(this.resultSetsAndCases);
  }

  open_settings() {
    const dialogRef = this.dialog.open(ResultSetsSettingsComponent, {
      data: {
        object: this.dropdownMenuItemSelect,
        cases: this.cases,
        result_sets: this.resultSets,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.path === 'case') {
          this.cases = this.cases.filter(obj => (obj.id !== result.id));
        } else {
           this.palladiumApiService.resultSets[this.stance.runId()]= this.palladiumApiService.resultSets[this.stance.runId()].filter(obj => (obj.id !== result.id));
        }
        this.navigate_to_run_show();
        this.merge_result_sets_and_cases();
        this.get_statistic();
      }
    });
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
    this.selectAllFlag = false;
    this.resultSetsAndCases.forEach(obj => {
      obj.selected = false;
    });
  }

  select() {
    let forSelect = this.searchPipe.transform(this.resultSetsAndCases, this.searchValue);
    forSelect = this.statusPipe.transform(forSelect, this.filter);
    forSelect.forEach(obj => {
      obj.selected = this.selectAllFlag;
    });
  }

  open_history_page() {
    const path = /\S*run\/(\d+)/.exec(this.router.url)[0] + '/case_history/';
    if (this.dropdownMenuItemSelect.path === 'case') {
      this.router.navigate([path, this.dropdownMenuItemSelect.id]);
    } else {
      const caseId = this.get_case_id_by_result_set(this.dropdownMenuItemSelect);
      this.router.navigate([path, caseId]);
    }
  }

  get_statistic() {
    const data = {};
    this.palladiumApiService.resultSets[this.stance.runId()].forEach(resultSet => {
      if (!data[resultSet.status]) {
        data[resultSet.status] = 0;
      }
      data[resultSet.status] += 1;
    });
    this.statistic = new Statistic(data);
    this.delete_filter_without_elements(data); // clear empty filters because need to keep results list no empty
    this.untestedPoint = new Point('0', this.cases.length - this.palladiumApiService.resultSets[this.stance.runId()].length, this.palladiumApiService.resultSets[this.stance.runId()].length);
    this.cd.detectChanges();
    this.stat.update_run_statistic(this.statistic);
  }

  delete_filter_without_elements(data) {
    this.filter.forEach((element, index) => {
      if (!data[element]) {
        this.filter.splice(index, 1);
      }
    });
  }

  get_case_id_by_result_set(resultSet) {
    return this.cases.filter(obj => obj.name === resultSet.name)[0].id;
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
    const activeElement = this.resultSetsAndCases.filter(obj => obj.active);
    if (activeElement.length !== 0) {
      activeElement[0].active = false;
    }
  }

  select_object() {
      if (/case_history\/(\d+)/.exec(this.router.url) !== null) {
      const id = +/case_history\/(\d+)/.exec(this.router.url)[1];
      const thisCase = this.cases.filter(object => object.id === id)[0];
      this.object = this.resultSetsAndCases.filter(obj => obj.name === thisCase.name)[0];
    }
    this.object = this.resultSetsAndCases.filter(obj => this.stance.case_or_result_set_by_url(obj))[0];
    if (this.object) {
      this.object.active = true;
    } else {
      this.navigate_to_run_show();
    }
  }

  get_selected_count() {
    return this.resultSetsAndCases.filter(obj => obj.selected).length;
  }

  update_click() {
    this.filter = [];
    this.get_result_sets_and_cases();
    this.selectAllFlag = false;
    if (this.resultComponent && this.stance.resultSetId()) {
      this.resultComponent.init_results();
    }
  }

  onActivate(componentRef) {
    this.resultComponent = componentRef;
  }

  clicked(event, object) {
    if (!(event.target.classList.contains('result-set-checkbox') ||
      event.target.classList.contains('mat-checkbox-inner-container') ||
      event.target.classList.contains('menu') ||
      event.target.classList.contains('mat-checkbox')) && object.path !== 'case') {
      this.open_results(object);
    }
  }

  copy_result_set_name() {
    const txtArea = document.createElement('textarea');
    txtArea.id = 'txt';
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = this.dropdownMenuItemSelect.name;
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

  unselect(object) {
    object.selected = false;
    if (this.get_selected_count() === 0) {
      this.cancel_result_custom();
    }
  }

  get_selected_for_add_result() {
    return this.resultSetsAndCases.filter(x => x.selected);
  }

  selected_result_sets() {
    return this.resultSetsAndCases.filter(obj => obj.path === 'result_set' && obj.selected);
  }

  selected_cases() {
    return this.resultSetsAndCases.filter(obj => obj.path === 'case' && obj.selected);
  }

  get status() {
    return this.newResultForm.get('status').value;
  }

  get message() {
    return this.newResultForm.get('message').value;
  }

  async add_result() {
    const resultSetsResultPromise = this.palladiumApiService.result_new(this.selected_result_sets(), this.message, this.status);
    const casesResultPromise = this.palladiumApiService.result_new_by_case(this.selected_cases(), this.message, this.status, this.stance.runId());
    const resultSetsResult = await resultSetsResultPromise;
    const casesResult = await casesResultPromise;
    this.update_result_sets(resultSetsResult);
    this.update_cases(casesResult);
    if (this.object && this.object.selected) {
      this.resultservice.update_results(resultSetsResult || casesResult);
    }
    this.get_statistic();
    this.unselect_all();
    this.newResultForm.reset(['name', 'status']);
    this.addResultOpen = false;
  }

  update_result_sets(resultSets) {
    if (!resultSets['result_sets']) {
      return;
    }
    resultSets['result_sets'].forEach(element => {
      this.resultSetsAndCases.find(object => object.name === element.name && object.path === 'result_set').status = element.status;
    });
  }

  update_cases(cases) {
    if (!cases['result_sets']) {
      return;
    }
    cases['result_sets'].forEach(element => {
      this.palladiumApiService.resultSets[this.stance.runId()].push(element);
      const index = this.resultSetsAndCases.findIndex(object => object.name === element.name && object.path === 'case');
      this.resultSetsAndCases[index] = element;
    });
  }

  cancel_result_custom() {
    this.addResultOpen = false;
  }

  add_result_open_menu() {
    const selected = this.resultSetsAndCases.filter(obj => obj.selected);
    this.addResultOpen = true;
    if (selected.length === 1) {
      this.newResultForm.patchValue({status: this.palladiumApiService.get_status_by_id(selected[0].status)});
    } else {
      this.newResultForm.reset('status');
    }
  }

  toggle_search() {
    this.searchToggle.toggle = !this.searchToggle.toggle;
    this.searchToggle.color = this.searchToggle.toggle ? 'accent' : 'none';
    if (!this.searchToggle.toggle) {
      this.searchValue = '';
    }
  }

  ngOnDestroy() {
    this.cd.detach();
    this.params.unsubscribe();
  }
}

@Component({
  selector: 'app-result-sets',
  templateUrl: 'result-sets.settings.component.html',
  providers: [ResultService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ResultSetsSettingsComponent implements OnInit {
  object;
  cases;
  objectForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private palladiumApiService: PalladiumApiService, @Inject(MAT_DIALOG_DATA) public data, private stance: StanceService) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.cases = this.data.cases;
    this.objectForm.patchValue({name: this.object.name});
  }

  get name() {
    return this.objectForm.get('name');
  }

  async edit_object() {
    if (this.object.path === 'result_set') {
      await this.palladiumApiService.edit_case_by_result_set_id(this.object.id, this.name.value);
      const caseForEdit = this.cases.find(currentCase => currentCase.name === this.object.name);
      caseForEdit.name = this.name.value;
    } else {
      await this.palladiumApiService.edit_case(this.object.id, this.name.value);
    }
    this.object.name = this.name.value;
    this.dialogRef.close();
  }

  async delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object.path === 'result_set') {
        await this.palladiumApiService.delete_result_set(this.object.id);
      } else {
        await this.palladiumApiService.delete_case(this.object.id, this.stance.productId());
      }
      this.dialogRef.close(this.object);
    }
  }

  name_is_existed() {
    if (this.name_is_not_changed()) {
      return false;
    }
    return this.data.cases.some(suite => suite.name === this.name.value);
  }

  name_is_not_changed() {
    return this.object.name === this.name.value;
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.objectForm.controls['name'].setErrors({'is_exist': true});
    }
  }
}
