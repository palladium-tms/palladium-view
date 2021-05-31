import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Statistic } from '../models/statistic';
import { ActivatedRoute, Router } from '@angular/router';
import { PalladiumApiService, StructuredResultSets, StructuredStatuses } from '../../services/palladium-api.service';
import { StanceService } from '../../services/stance.service';
import { ProductSettingsComponent } from '../products/products.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchPipe } from '../pipes/search/search.pipe';
import { CasefillingPipe } from './casefilling.pipe';
import { StatusFilterPipe } from '../pipes/status_filter_pipe/status-filter.pipe';
import { ResultSet } from '../models/result_set';
import { BehaviorSubject, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { Status } from '../models/status';
import { map, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { Case } from '../models/case';
import { Run } from 'app/models/run';
import { Plan } from 'app/models/plan';

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
  cases$: ReplaySubject<Case[]>;
  filteredCases$: Observable<Case[]>;
  cases: Case[] = [];
  selectedResultSet$ = new ReplaySubject(1);
  caseCount$: Observable<(number)>;
  statistic$: ReplaySubject<(Statistic)> = new ReplaySubject(1);
  statuses$: Observable<StructuredStatuses>;
  run: Run;
  plan: Plan;
  private unsubscribe: Subject<void> = new Subject();

  notBlockedStatuses: Status[];
  activeRoute$: Observable<number>;
  activeElement: ResultSet;

  resultSetCheckboxes: ObjectCheckbox;

  loading = false;
  deleting = false;
  refreshButtonStatus: ('disabled' | 'active') = 'disabled';

  addResultOpen = false;
  statistic: Statistic;
  object;
  resultComponent;
  statuses;
  resultSetsAndCases = [];
  filter: number[] = [];
  filter$: BehaviorSubject<number[]> = new BehaviorSubject([]);
  selectAllFlag = false;
  selectedCount = 0;
  dropdownMenuItemSelect;
  searchToggle: SearchToggle;

  searchFormControl = new FormControl();


  constructor(private activatedRoute: ActivatedRoute, private stance: StanceService,
    private palladiumApiService: PalladiumApiService, private router: Router,
    private dialog: MatDialog, private cd: ChangeDetectorRef) {
    this.searchToggle = { 'toggle': false, 'color': 'none' };

    this.filteredCases$ = merge(this.searchFormControl.valueChanges, this.filter$).pipe(switchMap(filter => {
      return this.cases$.pipe(switchMap(cases => {
        if (cases.length !== 0) {
          return this.resultSets$.pipe(map(resultSets => {
            let newElementPack = cases;
            newElementPack = this.filter_by_search(newElementPack, this.searchFormControl.value);
            newElementPack = this.filter_by_status(resultSets, newElementPack, this.filter$.getValue());
            return newElementPack;
          }))
        } else {
          // is a workaround for problem with showing cases from preview run after click to other run
          return new Observable<[]>((observer) => {
            return observer;
          });
        }
      }))
    }))
  }

  filter_by_status(resultSets: StructuredResultSets, cases: Case[], filter: number[]): Case[] {
    let newElementPack = []
    cases.forEach(currentCase => {
      if (this.contain_filtered_status(resultSets[currentCase.name], filter) || filter.length == 0) {
        newElementPack.push(currentCase);
      }
    });
    return newElementPack;
  }

  filter_by_search(cases: Case[], filter: string): Case[] {
    if (filter?.length > 0) {
      filter = filter.toLowerCase();
      return cases.filter(item => item.name.toLowerCase().includes(filter));
    } else {
      return cases;
    }
  }

  contain_filtered_status(element, filters: number[]) {
    if (element) {
      return filters.indexOf(+element.status) >= 0;
    } else {
      return filters.indexOf(0) > -1
    }
  }

  ngOnInit() {
    this.cases$ = this.palladiumApiService.currentCases$;
    this.caseCount$ = this.cases$.pipe(map(cases => cases.length));

    this.statuses$ = this.palladiumApiService.statuses$;
    this.statuses$.pipe(map(statuses => {
      this.notBlockedStatuses = [];
      Object.values(statuses).forEach(status => {
        if (!status.blocked) {
          this.notBlockedStatuses.push(status);
        }
      });
    }), takeUntil(this.unsubscribe)).subscribe();

    this.activeRoute$ = this.activatedRoute.params.pipe(pluck('id'));

    // get result sets and cases

    this.activeRoute$.pipe(map((id: number) => {
      this.filter = [];
      this.cases = [];
      this.selectAllFlag = false;
      this.resultSetCheckboxes = {};
      this.selectedCount = 0;
      this.loading = true;
      return id
    })).pipe(switchMap(id => {
      return this.palladiumApiService.plans$.pipe(switchMap(allPlans => {
        const plans = allPlans[this.stance.productId()];
        this.plan = plans.find(plan => plan.id === this.stance.planId());
        return this.plan.runs$.pipe(map(runs => {
          this.init_data(id);
          this.run = runs.find(run => run.id === this.stance.runId())
          this.resultSets$ = this.run.resultSets$.pipe(map(resultSets => {
            this.init_active_element(resultSets);
            let object = {};
            resultSets.forEach(retulsSet => {
              object[retulsSet.name] = retulsSet;
            })
            this.refreshButtonStatus = 'active';
            return object;
          }));

          this.update_run_statistic_from_filter(this.run);

           this.cd.detectChanges();
        }))
      }));
    }), takeUntil(this.unsubscribe)).subscribe();
  }

  init_active_element(resultSets) {
    const resultSetId = this.stance.resultSetId();
    if (resultSetId) {
      this.activeElement = resultSets.find(currentRs => currentRs.id === resultSetId);
      if (!this.activeElement) {
        this.navigate_to_run_show();
      }
    } else {
      this.activeElement = undefined;
    }
  }

  update_run_statistic_from_filter(run: Run) {
    run.statistic$.pipe(take(1), map(statistic => {
      this.statistic$.next(statistic);
        console.log('asdasdasd')
    })).subscribe()
  }

  select_filter(filter) {
    this.filter = filter;
    this.filter$.next(filter);
  }

  log(a) {
    console.log('log');
    return a;
  }

  init_data(id) {
    this.cases$.next([]);

    const productId = this.stance.productId();
    const planId = this.stance.planId();
    this.palladiumApiService.get_result_sets(id, productId).subscribe(() => {
      this.loading = false;
      this.cd.detectChanges();
    });
    this.palladiumApiService.get_cases_by_run_id(id, productId, planId).subscribe((result: [Case[], string]) => {
      const _cases = result[0]
      const runIdBubbered = result[1]
      if (+runIdBubbered === this.stance.runId()) {
        this.cases$.next(_cases);
      }
    });
  }

  open_settings() {
    this.dialog.open(ResultSetsSettingsComponent, {
      data: {
        object: this.dropdownMenuItemSelect,
        cases: this.cases,
        run: this.run,
        statistic$: this.statistic$
      }
    });
  }

  navigate_to_run_show() {
    this.router.navigate([/\S*run\/(\d+)/.exec(this.router.url)[0]], { relativeTo: this.activatedRoute });
  }

  selectAll(event) {
    if (!event.checked) {
      this.unselect_all();
    } else {
      this.filteredCases$.pipe(switchMap(objects => {
        return this.resultSets$.pipe(map(resultSet => {
          objects.forEach(object => {
            this.resultSetCheckboxes[object.name] = { checked: true, object: resultSet[object.name] ? resultSet[object.name] : object };
          });
          this.selectedCount = Object.values(this.resultSetCheckboxes).filter(Boolean).length;
        }))
      }), take(1)).subscribe();
    }
  }

  unselect_all() {
    this.resultSetCheckboxes = {};
    this.selectedCount = 0;
    this.selectAllFlag = false;
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
    const productId = this.stance.productId();
    const planId = this.stance.planId();
    this.loading = true;
    this.palladiumApiService.get_result_sets(this.stance.runId(), productId).subscribe(() => {
      if (this.activeElement?.path === 'result_set') {
        this.palladiumApiService.get_results(this.activeElement.id);
      }
      this.loading = false;
      this.cd.detectChanges();
    });
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
    this.resultSetCheckboxes[object.name].checked = false;
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
    const selectedObjects = this.get_selected_objects();
    const selectedResultSets = selectedObjects.filter(obj => !obj.suite_id);
    const selectedCases = selectedObjects.filter(obj => obj.suite_id);
    let resultStatus = false;
    if (selectedResultSets.length !== 0) {
      this.add_one_more_results_for_cases(selectedResultSets).subscribe(() => {
        if (selectedCases.length == 0 || resultStatus) {
          this.addResultOpen = false;
        }
        resultStatus = true;
        this.update_run_statistic_from_filter(this.run);
        this.cd.detectChanges();
      })
    }
    if (selectedCases.length !== 0) {
      this.add_results_for_cases(selectedCases).subscribe(() => {
        if (selectedResultSets.length == 0 || resultStatus) {
          this.addResultOpen = false;
        }
        resultStatus = true;
        this.update_run_statistic_from_filter(this.run);
        this.cd.detectChanges();
      });
    }
    this.newResultForm.reset(['name', 'status']);
    this.unselect_all();
  }

  add_one_more_results_for_cases(selectedResultSets) {
    return this.palladiumApiService.result_new(selectedResultSets, this.message, this.status, this.activeElement, this.run)
  }

  add_results_for_cases(selectedCases) {
    return this.palladiumApiService.result_new_by_case(selectedCases, this.message, this.status, this.stance.runId()).pipe(map(results => {
      this.run.resultSets$.pipe(take(1), map(resultSets => {
        results['result_sets'].forEach(resultSet => {
          const newResultSet = new ResultSet(resultSet);
          resultSets.push(newResultSet);
        });
        this.run.resultSets$.next(resultSets)
      })).subscribe();
    }));
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
      this.searchFormControl.reset()
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

  delete_all() {
    if (confirm('A u shuare? It is very fucking dangeros')) {
      this.deleting = true;
      const selectedObjects = this.get_selected_objects();
      const selectedResultSetIds = selectedObjects.filter(obj => !obj.suite_id).map(object => object.id);
      const selectedCaseIds = selectedObjects.filter(obj => obj.suite_id).map(object => object.id);
      this.palladiumApiService.delete_all_result_sets(selectedResultSetIds, this.stance.runId()).pipe(map(results => {
        if (results['errors'].length == 0) {
          this.run.resultSets$.pipe(take(1), map(resultSets => {
            this.run.resultSets$.next(resultSets.filter(resultSet => !selectedResultSetIds.includes(resultSet.id)))
          })).subscribe();
          this.run.statistic$.pipe(take(1)).subscribe(statistic => {
            this.statistic$.next(statistic);
          })
        } else {
          // error) TODO
        }
      }), switchMap(() => {
        if (selectedCaseIds.length > 0) {
          return this.palladiumApiService.delete_case_obs(selectedCaseIds, this.stance.productId(), this.stance.planId());
        } else {
          return Observable.create(observer => observer.next());
        }

      })).subscribe(() => {
        this.unselect_all();
        this.deleting = false;
      });
    }
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
  run: Run;
  statistic$: ReplaySubject<Statistic>;
  objectForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>, private cd: ChangeDetectorRef, private router: Router,
    private palladiumApiService: PalladiumApiService, @Inject(MAT_DIALOG_DATA) public data, private stance: StanceService) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.run = this.data.run;
    this.statistic$ = this.data.statistic$;
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
        if (this.object.id === this.stance.resultSetId()) {
          this.router.navigate([/.*run\/\d+/.exec(this.router.url)[0]]).then(() => {
            this.delete_result_set(this.object.id, this.stance.runId())
          });
        } else {
          this.delete_result_set(this.object.id, this.stance.runId())
        }
      } else {
        this.delete_case(this.object.id, this.stance.productId(), this.stance.planId());
      }
      this.dialogRef.close(this.object);
    }
  }

  delete_result_set(id: number, runId: number): void {
    this.palladiumApiService.delete_result_set(id, runId).pipe(map(() => {
      this.run.resultSets$.pipe(take(1), map(resultSets => {
        this.run.resultSets$.next(resultSets.filter(resultSet => resultSet.id !== id))
      })).subscribe();
      this.run.statistic$.pipe(take(1)).subscribe(statistic => {
        this.statistic$.next(statistic);
      })
    })).subscribe();
  }

  delete_case(id: number, productId: number, planId: number) {
    this.palladiumApiService.delete_case(id, productId, planId);
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
