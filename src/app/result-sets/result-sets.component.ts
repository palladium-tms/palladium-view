import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Statistic } from '../models/statistic';
import { ActivatedRoute, Router } from '@angular/router';
import { PalladiumApiService, StructuredStatuses } from '../../services/palladium-api.service';
import { StanceService } from '../../services/stance.service';
import { ProductSettingsComponent } from '../products/products.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchPipe } from '../pipes/search/search.pipe';
import { CasefillingPipe } from './casefilling.pipe';
import { StatusFilterPipe } from '../pipes/status_filter_pipe/status-filter.pipe';
import { ResultSet } from '../models/result_set';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { Status } from '../models/status';
import { takeUntil } from 'rxjs/operators';
import { Case } from '../models/case';

export interface SearchToggle {
  toggle: boolean;
  color: 'none' | 'accent';
}

export interface ObjectCheckbox {
  string?: {
    checked: boolean,
    object: ResultSet
  };
}

@Component({
  selector: 'app-result-sets',
  templateUrl: './result-sets.component.html',
  styleUrls: ['./result-sets.component.scss'],
  providers: [SearchPipe, StatusFilterPipe, CasefillingPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultSetsComponent implements OnInit, OnDestroy {
  newResultForm = new FormGroup({
    status: new FormControl('', [Validators.required]),
    message: new FormControl('')
  });

  resultSets$: Observable<{}>;
  cases$: Observable<Case[]>;
  cases: Case[] = [];
  selectedResultSet$ = new ReplaySubject(1);
  caseCount$: Observable<(number)>;
  statistic$: Observable<(Statistic)>;
  statuses$: Observable<StructuredStatuses>;
  private unsubscribe: Subject<void> = new Subject();

  notBlockedStatuses: Status[];
  activeRoute$: Observable<number>;
  activeElement: ResultSet;

  resultSetCheckboxes: ObjectCheckbox;

  loading = false;
  refreshButtonStatus: ('disabled' | 'active') = 'disabled';

  addResultOpen = false;
  statistic: Statistic;
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

  constructor(private activatedRoute: ActivatedRoute, private stance: StanceService,
    private palladiumApiService: PalladiumApiService, private router: Router,
    private dialog: MatDialog, private cd: ChangeDetectorRef,
    private searchPipe: SearchPipe, private statusPipe: StatusFilterPipe, private casefillingPipe: CasefillingPipe) {
    this.searchToggle = { 'toggle': false, 'color': 'none' };
  }

  ngOnInit() {
    this.resultSets$ = this.palladiumApiService.currentResultSets$.map(resultSets => {
      const resultSetId = this.stance.resultSetId();
      if (resultSetId) {
        this.activeElement = resultSets.find(currentRs => currentRs.id === resultSetId);
      } else {
        this.activeElement = undefined;
      }
      let object = {};
      resultSets.forEach(retulsSet => {
        object[retulsSet.name] = retulsSet;
      })
      return object;
    });

    this.cases$ = this.palladiumApiService.currentCases$;
    this.caseCount$ = this.cases$.map(cases => cases.length);

    this.statuses$ = this.palladiumApiService.statuses$;
    this.statuses$.map(statuses => {
      this.notBlockedStatuses = [];
      Object.values(statuses).forEach(status => {
        if (!status.blocked) {
          this.notBlockedStatuses.push(status);
        }
      });
    }).pipe(takeUntil(this.unsubscribe)).subscribe();
    this.activeRoute$ = this.activatedRoute.params.pluck('id');

    // get result sets and cases

    this.activeRoute$.map((id: number) => {
      this.filter = [];
      this.cases = [];
      this.selectAllFlag = false;
      this.resultSetCheckboxes = {};
      this.selectedCount = 0;
      this.init_data(id);
    }).switchMap(() => {
      return this.palladiumApiService.plans$.switchMap(allPlans => {
        const plans = allPlans[this.stance.productId()];
        const plan = plans.find(plan => plan.id === this.stance.planId());
        return plan.runs$.map(runs => {
          let run = runs.find(run => run.id === this.stance.runId())
          this.statistic$ = run.statistic$;
          this.cd.detectChanges();
        })
      });
    }).pipe(takeUntil(this.unsubscribe)).subscribe();
  }

  select_filter(filter) {
    this.filter = filter;
  }

  log(a) {
    console.log('log');
    return a;
  }

  init_data(id) {
    const runId = this.stance.runId();
    const productId = this.stance.productId();
    const planId = this.stance.planId();
    this.palladiumApiService.get_result_sets(id);
    this.palladiumApiService.get_cases_by_run_id(runId, productId, planId);
  }

  open_settings() {
    this.dialog.open(ResultSetsSettingsComponent, {
      data: {
        object: this.dropdownMenuItemSelect,
        cases: this.cases,
      }
    });
  }

  navigate_to_run_show() {
    this.router.navigate([/\S*run\/(\d+)/.exec(this.router.url)[0]], { relativeTo: this.activatedRoute });
  }

  selectAll(event) {
    if (!event.checked) {
      this.unselect_all();
      return;
    }
    this.resultSets$.map(resultSets => {
      // let forSelect = this.casefillingPipe.transform(resultSets, this.cases);
      // forSelect = this.searchPipe.transform(forSelect, this.searchValue);
      // forSelect = this.statusPipe.transform(forSelect, this.filter);
      // forSelect.forEach(object => {
      //   this.resultSetCheckboxes[object.name] = {checked: true, object};
      // });
      this.selectedCount = Object.values(this.resultSetCheckboxes).filter(Boolean).length;
    }).first().subscribe();
  }

  unselect_all() {
    this.resultSetCheckboxes = {};
    this.selectedCount = 0;
  }

  delete_filter_without_elements(data) {
    this.filter.forEach((element, index) => {
      if (!data[element]) {
        this.filter.splice(index, 1);
      }
    });
  }

  open_results(object) {
    this.reset_active();
    this.activeElement = object;
    this.cd.detectChanges();
    if (object.path === 'result_set') {
      this.router.navigate(['result_set', object.id], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['case', object.id], { relativeTo: this.activatedRoute });
    }
  }

  reset_active() {
    const activeElement = this.resultSetsAndCases.filter(obj => obj.active);
    if (activeElement.length !== 0) {
      activeElement[0].active = false;
    }
  }

  update_click() {
    this.refreshButtonStatus = 'disabled';
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
    this.loading = true;
    const selectedObjects = this.get_selected_objects();
    const selectedResultSets = selectedObjects.filter(obj => !obj.suite_id);
    const selectedCases = selectedObjects.filter(obj => obj.suite_id);
    let resultStatus = false;

    if (selectedResultSets.length !== 0) {
      this.palladiumApiService.result_new(selectedResultSets, this.message, this.status).subscribe(() => {
        if (selectedCases.length === 0 || resultStatus) {
          this.addResultOpen = false;
        }
        resultStatus = true;
        this.cd.detectChanges();
      });
    }
    if (selectedCases.length !== 0) {
      this.palladiumApiService.result_new_by_case(selectedCases, this.message, this.status, this.stance.runId()).subscribe(() => {
        if (selectedResultSets.length === 0 || resultStatus) {
          this.addResultOpen = false;
        }
        resultStatus = true;
        this.cd.detectChanges();
      });
    }
    this.newResultForm.reset(['name', 'status']);
    this.unselect_all();
  }

  cancel_result_custom() {
    this.addResultOpen = false;
    this.cd.detectChanges();
  }

  add_result_open_menu() {
    this.selectedResultSet$.next(this.get_selected_objects());
    this.addResultOpen = true;
  }

  get_selected_objects() {
    const _selectedObjects = [];
    Object.keys(this.resultSetCheckboxes).forEach(name => {
      if (this.resultSetCheckboxes[name]?.checked) {
        _selectedObjects.push(this.resultSetCheckboxes[name].object);
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
    this.resultSetCheckboxes[object.name] = { checked: $event.checked, object };
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

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>, private cd: ChangeDetectorRef, private router: Router,
    private palladiumApiService: PalladiumApiService, @Inject(MAT_DIALOG_DATA) public data, private stance: StanceService) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.objectForm.patchValue({ name: this.object.name });
  }

  get name() {
    return this.objectForm.get('name');
  }

  edit_object() {
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

  delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object.path === 'result_set') {
        this.palladiumApiService.delete_result_set(this.object.id, this.stance.runId());
        if (this.object.id === this.stance.resultSetId()) {
          this.router.navigate([/.*run\/\d+/.exec(this.router.url)[0]]);
        }
      } else {
        this.palladiumApiService.delete_case(this.object.id, this.stance.productId(), this.stance.planId());
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
      this.objectForm.controls['name'].setErrors({ 'is_exist': true });
    }
  }
}
