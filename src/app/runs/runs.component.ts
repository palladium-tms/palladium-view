import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Suite} from '../models/suite';
import {Router} from '@angular/router';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {StanceService} from '../../services/stance.service';
import {Statistic, Point} from '../models/statistic';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProductSettingsComponent} from '../products/products.component';
import {Run} from '../models/run';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class RunsComponent implements OnInit, OnDestroy {
  suites = [];
  private unsubscribe: Subject<void> = new Subject();
  runs$: ReplaySubject<Run[]> = new ReplaySubject(1);
  suites$: ReplaySubject<Suite[]> = new ReplaySubject(1);
  loading = true;
  untestedSpace;
  activeRoute$: Observable<number>;
  params;
  object_for_settings;

  statistic$: ReplaySubject<(Statistic)> = new ReplaySubject<Statistic>();
  caseCount$: ReplaySubject<(number)> = new ReplaySubject<number>();
  statuses$: Observable<StructuredStatuses>;
  filter: number[] = []; // ids of active statuses
  activeObject: Run;

  constructor(private palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private statisticService: StatisticService,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.get_suites();

    this.activeRoute$ = this.activatedRoute.params.pluck('id').map(id => +id);
    this.statuses$ = this.palladiumApiService.statuses$;

    this.activeRoute$.map((id: number) => {
      this.loading = true;
      this.get_runs(id);
      this.init_active_object(id);
    }).pipe(takeUntil(this.unsubscribe)).subscribe();

    // update plan statistic after adding new result
    this.activeRoute$.switchMap(id => {
      return this.palladiumApiService.plans$.switchMap(plans => {
        const productId = this.stance.productId();
        if (plans[productId].find(plan => plan.id === id)) {
          return this.statistic$.map(statistic => {
            plans[this.stance.productId()].find(plan => plan.id === id).statistic$.next(statistic)
          });
        }
      });
    }).pipe(takeUntil(this.unsubscribe)).subscribe();

    // update statistic after adding new result
    this.palladiumApiService.runs$.subscribe(runs => {
      if (runs[this.stance.planId()]) {
        const statistic = this.get_statistic(runs[this.stance.planId()]);
        this.statistic$.next(statistic);
      }
    });
  }

  get_statistic(runs: Run[]): Statistic {
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
  }

  get_runs(id) {
    this.untestedSpace = {};
    this.palladiumApiService.init_runs(id).subscribe( runs => {
      this.loading = false;
      this.runs$.next(runs);
      if (this.suites) {
        this.get_untested_space();
      }
      this.cd.detectChanges();
    });
  }

  get_suites() {
      this.palladiumApiService.products$.map(products => {
        const productId = this.stance.productId();
        const product = products.find(product => product.id === productId);
        product.caseCount$.first().subscribe(caseCount => {
          this.caseCount$.next(caseCount);
        });
        this.suites$ = product.suites$;
        if (this.runs$) {
          this.get_untested_space();
        }
      }).pipe(takeUntil(this.unsubscribe)).subscribe();
  }

  init_active_object(id) {
    this.palladiumApiService.runs$.map(runs => runs[id]).first().subscribe(runs => {
      const runId = this.stance.runId();
      if (runId) {
        this.activeObject = runs.find(run => run.id === +runId);
      } else {
        this.activeObject = undefined;
      }
    });
  }

  update_click() {
   this.palladiumApiService.get_runs(this.stance.planId());
    this.cd.detectChanges();
    // if (this.ResultSetComponent && this.stance.runId()) {
    //   this.ResultSetComponent.update_click();
    // }
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

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(result => {
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

  clicked(event, object) {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      this.select_object(object);
    }
  }

  select_object(object) {
    this.activeObject = object;
    this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/' + object.path + '/' + object.id]);
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
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  log() {
    // console.log('x');
  }

  get_untested_space() {
    this.suites$.switchMap(suites => {
      return this.runs$.map(runs => {
          this.untestedSpace = {};
          const suitesStatistic = {};
          if (!suites || !runs) { return; }
          suites.map(suite => {
            suitesStatistic[suite.name] = suite.statistic;
          });
          runs.map(run => {
            this.untestedSpace[run.name] = {'attitude': (1-(run.statistic.all/suitesStatistic[run.name].all))*100,
              'point': new Point(0, suitesStatistic[run.name].all - run.statistic.all, suitesStatistic[run.name].all)};
          });
      });
    }).first().subscribe();
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
      // this.palladiumApiService.edit_suite(this.object.id, this.object.name).then((suite: Suite) => {
      //   this.object.name = suite.name;
      //   this.object.updated_at = suite.updated_at;
      // });
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
