import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Suite} from '../models/suite';
import {Router} from '@angular/router';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {StanceService} from '../../services/stance.service';
import {Statistic, Point} from '../models/statistic';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {ProductSettingsComponent} from '../products/products.component';
import {Run} from '../models/run';
import {Observable, ReplaySubject} from 'rxjs';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunsComponent implements OnInit, OnDestroy {
  suites = [];
  runs: Run[];
  runs$: Observable<Run[]>;
  activeRoute$: Observable<{}>;
  params;

  runs_and_suites = [];
  ResultSetComponent;
  untestedCash = {};
  statistic$: ReplaySubject<Statistic>;
  statuses$: Observable<StructuredStatuses>;
  filter: number[] = []; // ids of active statuses
  dataLoading = true;
  activeObject: Run;
  object_for_settings;

  constructor(private palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private statisticService: StatisticService,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.runs$ = this.palladiumApiService.runs$.map(runs => runs[this.stance.planId()]);
    this.statuses$ = this.palladiumApiService.statuses$;
    this.activeRoute$ = this.activatedRoute.params.pluck('id').map(id => +id);

    this.runs$.switchMap((runs) => {
      this.dataLoading = false;
      return this.palladiumApiService.plans$.map(plans => {
        const plan = plans[this.stance.productId()].find(plan => plan.id === this.stance.planId());
        plan.statistic$.next(this.get_statistic(runs));
      });
    }).subscribe(() => {this.dataLoading = false;});

    this.params = this.activeRoute$.switchMap(id => {
      this.runs$ = this.palladiumApiService.runs$.map(runs => runs[this.stance.planId()]);
      this.runs$.first().subscribe(runs => {
        const runId = this.stance.runId();
        if (runId) {
         this.activeObject = runs.find(run => run.id === +runId);
        }
      });

      return this.palladiumApiService.plans$.map(plans => {
        if (plans[this.stance.productId()].find(plan => plan.id === id)) {
          this.statistic$ = plans[this.stance.productId()].find(plan => plan.id === id).statistic$;
        }
      });
    }).subscribe(() => this.cd.detectChanges());

    this.activeRoute$.map(id => {
      this.palladiumApiService.init_runs(id);
    }).subscribe();

    // this.activeRoute$.map(id => {
    //
    //   // return this.palladiumApiService.runs$.map((plans: StructuredPlans) => {
    //   //
    //   // });
    //
    //     this.runs = runs[id];
    //   if (this.stance.planId()) {
    //     this.selectedPlanId = this.plans.find(plan => plan.id === this.stance.planId()).id;
    //   }
    // }).map(() => this.cd.detectChanges()).subscribe();



    // this.palladiumApiService.statusObservable.subscribe(() => {
    //   this.cd.detectChanges();
    // });
    //
    // this.statistic_service.statistic_has_changed().subscribe(statistic => {
    //   if (this.runs_and_suites.length === 0 || !this.palladiumApiService.plans[this.stance.productId()]) {return;}
    //   this.runs_and_suites.filter(object => this.stance.run_or_suite_by_url(object))[0].statistic = statistic;
    //   this.get_statistic();
    //   this.merge_suites_and_runs();
    //   this.statistic_service.update_plan_statistic(this.statistic);
    // });
  }

  get_statistic(runs) {
    const data = {};
    runs.forEach(run => {
      run.statistic$.first().subscribe(statistic => {
        statistic.points.forEach(point => {
          if (!data[point.status]) {
            data[point.status] = 0;
          }
          data[point.status] += point.count;
        });
      });
    });
    return new Statistic(data);
    // this.untestedPoint = new Point('0', this.palladiumApiService.case_count(this.stance.productId()) - this.statistic.all, this.statistic.all);
  }

  update_click() {
    this.dataLoading = true;
    this.palladiumApiService.get_runs(this.stance.planId());
    this.cd.detectChanges();
    // if (this.ResultSetComponent && this.stance.runId()) {
    //   this.ResultSetComponent.update_click();
    // }
  }

  merge_suites_and_runs() {
    const suiteForAdd = [];
    this.untestedCash = [];
    this.suites.forEach(suite => {
      const run = this.runs.find(run => run.name === suite.name);
      if (run) {
        if (run.statistic.points.length === 0) {
          this.untestedCash[run.name] = this.suites.find(suite => suite.name === run.name).statistic.points[0];
        } else {
          this.untestedCash[run.name] = new Point(0, suite.statistic.all - run.statistic.all, suite.statistic.all);
        }
      } else {
        suiteForAdd.push(suite);
      }
    });
    this.runs_and_suites = this.runs.concat(suiteForAdd);
  }

  select_filter(filter) {
    this.filter = filter;
  }

  open_settings() {
    const dialogRef = this.dialog.open(RunsSettingsComponent, {
      data: {
        object: this.object_for_settings,
        suites: this.suites,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.path === 'run') {
          // this.runs = this.runs.filter(currentRun => currentRun.id !== result.id);
          // const object = this.suites.find(suite => suite.name === result.name);
          // this.merge_suites_and_runs();
          // this.select_object(object);
          // this.get_statistic();
        } else {
          // this.suites = this.suites.filter(currentSuite => currentSuite.id !== result.id);
          this.router.navigate([this.router.url.replace(/\/suite.*/, '')]);
          // this.merge_suites_and_runs();
          // this.get_statistic();
        }
      }
      this.cd.detectChanges();
    });
  }

  onActivate(componentRef) {
    this.ResultSetComponent = componentRef;
  }

  clicked(event, object) {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      this.select_object(object);
    }
  }

  select_object(object) {
    if (this.activeObject === object || object.id === 0) {
      return;
    }
    this.activeObject = object;
    this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/' + this.activeObject.path + '/' + this.activeObject.id]);
  }

  get_selected_object() {
    const part_of_url = /(run|suite)\/(\d+)/.exec(this.router.url);
    if (part_of_url) {
      this.activeObject = this.runs_and_suites.find(element => element.path == part_of_url[1] && element.id == part_of_url[2]);
    } else {
      this.activeObject = new Run(null);
    }
  }

  // make_run() {
  //   const creatingRunPromise = this.palladiumApiService.create_run(this.object_for_settings.name, this.stance.planId());
  //   const newRun = new Run(null);
  //   newRun.name = this.object_for_settings.name;
  //   newRun.statistic = new Statistic({});
  //   this.runs.push(newRun);
  //   if (this.selected_object.name === this.object_for_settings.name) {
  //     this.selected_object = newRun;
  //   }
  //   this.merge_suites_and_runs();
  //   this.cd.detectChanges();
  //   creatingRunPromise.then(result => {
  //     const obj = this.runs_and_suites.find(object => object.name === result.name);
  //     obj.id = result.id;
  //     obj.created_at = result.created_at;
  //     obj.updated_at = result.updated_at;
  //     if (this.selected_object.name === obj.name) {
  //       this.selected_object = obj;
  //     }
  //     this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/' + this.selected_object.path + '/' + this.selected_object.id]);
  //     this.cd.detectChanges();
  //   });
  // }

  ngOnDestroy() {
    this.cd.detach();
    this.params.unsubscribe();
  }

  log(a) {
    console.log(a);
  }
}

@Component({
  selector: 'app-runs-settings',
  templateUrl: 'runs-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunsSettingsComponent implements OnInit {
  object;
  formGroup = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private palladiumApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private router: Router, @Inject(MAT_DIALOG_DATA) public data, private stance: StanceService,) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.formGroup.patchValue({name: this.object.name});
  }

  get name() {
    return this.formGroup.get('name');
  }

  edit_object() {
    if (this.name.value !== this.object.name) {
      this.editing();
    }
    this.dialogRef.close();
  }

  editing() {
    if (this.run_opened) {
      this.palladiumApiService.edit_suite_by_run_id(this.object, this.name.value, this.stance.planId());
    } else {
      this.palladiumApiService.edit_suite(this.object.id, this.object.name).then((suite: Suite) => {
        this.object.name = suite.name;
        this.object.updated_at = suite.updated_at;
      });
    }
  }

  delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object.path === 'run') {
        this.palladiumApiService.delete_run(this.object);
      } else {
        // await this.ApiService.delete_suite(this.object.id);
      }
      this.dialogRef.close(this.object);
    }
  }

  run_opened() {
    return this.router.url.indexOf('run') >= 0;
  }

  name_is_existed() {
    if (this.name_is_not_changed()) {
      return false;
    }
    return this.data.suites.some(suite => suite.name === this.name.value);
  }

  name_is_not_changed() {
    return this.object.name === this.name.value;
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.formGroup.controls['name'].setErrors({'is_exist': true});
    }
  }
}
