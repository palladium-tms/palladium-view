import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Point, Statistic} from '../models/statistic';
import {ActivatedRoute, Router} from '@angular/router';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {StanceService} from '../../services/stance.service';
import {ProductSettingsComponent} from '../products/products.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SearchPipe} from '../pipes/search/search.pipe';
import {StatusFilterPipe} from '../pipes/status_filter_pipe/status-filter.pipe';
import {ResultSet} from '../models/result_set';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {Status} from '../models/status';
import {takeUntil} from 'rxjs/operators';

export interface SearchToggle {
  toggle: boolean;
  color: 'none' | 'accent';
}

export interface ObjectCheckbox {
  number?: {
    checked: boolean,
    object: ResultSet
  };
}

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.scss'],
  providers: [SearchPipe, StatusFilterPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultSetsComponent implements OnInit, OnDestroy {
  newResultForm = new FormGroup({
    status: new FormControl('', [Validators.required]),
    message: new FormControl('')
  });

  resultSets$: Observable<ResultSet[]>;
  selectedResultSet$ = new ReplaySubject(1);
  statistic$: ReplaySubject<(Statistic)> = new ReplaySubject<Statistic>();
  statuses$: Observable<StructuredStatuses>;
  private unsubscribe: Subject<void> = new Subject();

  notBlockedStatuses: Status[];
  activeRoute$: Observable<number>;
  activeElement: ResultSet;

  resultSetCheckboxes: ObjectCheckbox;

  params;

  addResultOpen = false;
  statistic: Statistic;
  untestedPoint: Point;
  cases;
  object;
  resultComponent;
  statuses;
  resultSetsAndCases = [];
  filter: number[] = [];
  selectAllFlag = false;
  selectedCount = 0;
  dropdownMenuItemSelect;
  searchToggle: SearchToggle;
  searchValue;

  constructor(private activatedRoute: ActivatedRoute, public stat: StatisticService, private stance: StanceService,
              private palladiumApiService: PalladiumApiService, private router: Router,
              private dialog: MatDialog, private cd: ChangeDetectorRef,
              private searchPipe: SearchPipe, private statusPipe: StatusFilterPipe) {
    this.searchToggle = {'toggle': false, 'color': 'none'};
  }

  ngOnInit() {
    this.resultSets$ = this.palladiumApiService.resultSets$.map(resultSets => resultSets[this.stance.runId()]);
    this.statuses$ = this.palladiumApiService.statuses$;
    this.statuses$.map(statuses => {
      this.notBlockedStatuses = [];
      Object.values(statuses).forEach(status => {
        if (!status.blocked) {
          this.notBlockedStatuses.push(status);
        }
      });
    }).pipe(takeUntil(this.unsubscribe)).subscribe();

    this.activeRoute$ = this.activatedRoute.params.pluck('id').map(id => +id);

    this.activeRoute$.map(id => {
      this.filter = [];
      this.selectAllFlag = false;
      this.resultSetCheckboxes = {};
      this.selectedCount = 0;
      this.palladiumApiService.get_result_sets(id);
    }).map(() => this.cd.detectChanges()).pipe(takeUntil(this.unsubscribe)).subscribe();

    this.activeRoute$.switchMap(() => {
      return this.resultSets$.map(resultSets => {
        if (resultSets) {
          const resultSetId = this.stance.resultSetId();
          this.get_statistic(resultSets);
          if (resultSetId) {
            this.activeElement = resultSets.find(currentRs => currentRs.id === resultSetId);
          } else {
            this.activeElement = undefined;
          }
        }
      });
    }).pipe(takeUntil(this.unsubscribe)).subscribe();

    this.activeRoute$.switchMap(id => {
      return this.palladiumApiService.runs$.map(runs => {
        const planId = this.stance.planId();
        const run = runs[planId].find(plan => plan.id === id);
        if (run) {
          run.statistic$.first().subscribe(statistic => this.statistic$.next(statistic));
        }
      });
    }).pipe(takeUntil(this.unsubscribe)).subscribe();

    this.statistic$.switchMap(statistic => {
      return this.palladiumApiService.runs$.map(runs => {
        const planId = this.stance.planId();
        const runId = this.stance.runId();
        runs[planId].find(run => run.id === runId).statistic$.next(statistic);
      });
    }).pipe(takeUntil(this.unsubscribe)).subscribe();

    return this.palladiumApiService.resultSets$.pipe(takeUntil(this.unsubscribe)).subscribe(resultSets => {
      const _resultSets = resultSets[this.stance.runId()];
      if (_resultSets) {
        this.get_statistic(resultSets[this.stance.runId()]);
      }
    });
  }

  select_filter(filter) {
    this.filter = filter;
  }

  // async get_result_sets_and_cases() {
  //   this.resultSetsAndCases = [];
  //   this.cd.detectChanges();
  //   Promise.all([this.get_cases(), this.palladiumApiService.get_result_sets(this.stance.runId())]).then(res => {
  //     this.cases = res[0];
  //     this.merge_result_sets_and_cases();
  //     this.select_object();
  //     this.get_statistic();
  //     if (this.statuses) {
  //       this.set_filters();
  //     }
  //     this.cd.detectChanges();
  //   });
  // }

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
    this.dialog.open(ResultSetsSettingsComponent, {
      data: {
        object: this.dropdownMenuItemSelect,
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

  selectAll(event) {
    if (!event.checked) {
      this.resultSetCheckboxes = {};
      this.selectedCount = 0;
      return;
    }
    this.resultSets$.map(resultSets => {
      let forSelect = this.searchPipe.transform(resultSets, this.searchValue);
      forSelect = this.statusPipe.transform(forSelect, this.filter);
      forSelect.forEach(object => {
        this.resultSetCheckboxes[object.id] = {checked: true, object};
      });
      this.selectedCount = Object.values(this.resultSetCheckboxes).filter(Boolean).length;
    }).first().subscribe();
  }

  get_statistic(resultSets) {
    const data = {};
    resultSets.forEach(resultSet => {
      if (!data[resultSet.status]) {
        data[resultSet.status] = 0;
      }
      data[resultSet.status] += 1;
    });
    this.delete_filter_without_elements(data); // clear empty filters because need to keep results list no empty
    // this.untestedPoint = new Point('0', this.cases.length - this.palladiumApiService.resultSets[this.stance.runId()].length, this.palladiumApiService.resultSets[this.stance.runId()].length);
    this.statistic$.next(new Statistic(data));
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
    this.activeElement = object;
    this.cd.detectChanges();
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

  update_click() {
    this.palladiumApiService.get_result_sets(this.stance.runId());
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
    this.resultSetCheckboxes[object.id].checked = false;
    this.selectedResultSet$.next(this.get_selected_objects());
    this.selectedCount = Object.values(this.resultSetCheckboxes).filter(resultSet => resultSet.checked).length;
    if (this.selectedCount === 0) {
      this.cancel_result_custom();
    }
    this.cd.detectChanges();
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

  add_result() {
    this.palladiumApiService.result_new(this.get_selected_objects(), this.message, this.status);
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
    this.cd.detectChanges();
  }

  add_result_open_menu() {
    this.selectedResultSet$.next(this.get_selected_objects());
    this.addResultOpen = true;
    // if (selected.length === 1) {
    //   this.newResultForm.patchValue({status: this.palladiumApiService.get_status_by_id(selected[0].status)});
    // } else {
    //   this.newResultForm.reset('status');
    // }
  }

  get_selected_objects() {
    const _selectedObjects = [];
    Object.keys(this.resultSetCheckboxes).map(id => +id).forEach(id => {
      if (this.resultSetCheckboxes[id].checked) {
        _selectedObjects.push(this.resultSetCheckboxes[id].object);
      }
    });
    return _selectedObjects;
  }

  toggle_search() {
    this.searchToggle.toggle = !this.searchToggle.toggle;
    this.searchToggle.color = this.searchToggle.toggle ? 'accent' : 'none';
    if (!this.searchToggle.toggle) {
      this.searchValue = '';
    }
  }

  checkbox_change($event, object) {
    this.resultSetCheckboxes[object.id] = {checked: $event.checked, object};
    this.selectedCount = Object.values(this.resultSetCheckboxes).filter(checkbox => checkbox.checked).length;
    if (this.selectedCount === 0) {
      this.selectAllFlag = false;
    }
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.cd.detach();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}

@Component({
  selector: 'app-result-sets',
  templateUrl: 'result-sets.settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ResultSetsSettingsComponent implements OnInit {
  object;
  objectForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private palladiumApiService: PalladiumApiService, @Inject(MAT_DIALOG_DATA) public data, private stance: StanceService) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.objectForm.patchValue({name: this.object.name});
  }

  get name() {
    return this.objectForm.get('name');
  }

  async edit_object() {
    if (this.object.path === 'result_set') {
      this.palladiumApiService.edit_case_by_result_set_id(this.object.id, this.stance.runId(), this.name.value);
      // const caseForEdit = this.cases.find(currentCase => currentCase.name === this.object.name);
      // caseForEdit.name = this.name.value;
    } else {
      // await this.palladiumApiService.edit_case(this.object.id, this.name.value);
    }
    // this.object.name = this.name.value;
    this.dialogRef.close();
  }

  async delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object.path === 'result_set') {
        await this.palladiumApiService.delete_result_set(this.object.id, this.stance.runId());
      } else {
        // await this.palladiumApiService.delete_case(this.object.id, this.stance.productId());
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
    // if (this.name_is_existed()) {
    //   this.objectForm.controls['name'].setErrors({'is_exist': true});
    // }
  }
}
