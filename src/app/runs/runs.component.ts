import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Suite} from '../models/suite';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {StanceService} from '../../services/stance.service';
import {Statistic, Point} from '../models/statistic';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {ProductSettingsComponent} from '../products/products.component';
import {Run} from '../models/run';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunsComponent implements OnInit, OnDestroy {
  suites = [];
  runs = [];
  runs_and_suites = [];
  params;
  ResultSetComponent;
  untestedCash = {};
  untestedPoint: Point;
  statistic$: Observable<Statistic>;
  filter: number[] = []; // ids of active statuses
  loading = false;
  selected_object: Run;
  object_for_settings;

  constructor(private palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private statistic_service: StatisticService,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.activatedRoute.params.pluck('id').map(id => +id).switchMap(id => {
      return this.palladiumApiService.plans$.map(plans => {
        this.statistic$ = plans[this.stance.productId()].find(plan => plan.id === id).statistic$.pipe();
      });

      // this.get_runs_and_suites();
      // this.filter = [];
    }).map(() => this.cd.detectChanges()).subscribe();

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

  get_runs(planId) {
    return this.palladiumApiService.get_runs(planId).then(runs => {
      return runs;
    });
  }

  click() {
    this.cd.detectChanges();
  }

  async get_suites() {
    if (!this.palladiumApiService.suites[this.stance.productId()]) {
      await this.palladiumApiService.get_suites(this.stance.productId());
    }
    return this.palladiumApiService.suites[this.stance.productId()];
  }

  get_runs_and_suites() {
    this.runs_and_suites = [];
    this.loading = true;
    this.cd.detectChanges();
    Promise.all([this.get_runs(this.stance.planId()), this.get_suites()]).then(res => {
      this.suites = res[1];
      this.runs = res[0][this.stance.planId()];
      this.merge_suites_and_runs();
      this.get_statistic();
      this.loading = false;
      this.get_selected_object();
      this.cd.detectChanges();
    });
  }

  get_statistic() {
    const data = {};
    this.runs.forEach(run => {
      run.statistic.points.forEach(point => {
        if (!data[point.status]) { data[point.status] = 0; }
        data[point.status] += point.count;
      });
    });
    this.statistic = new Statistic(data);
    this.untestedPoint = new Point('0', this.palladiumApiService.case_count(this.stance.productId()) - this.statistic.all, this.statistic.all);
  }

  update_click() {
    this.get_runs_and_suites();
    if (this.ResultSetComponent && this.stance.runId()) {
      this.ResultSetComponent.update_click();
    }
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

  select_filter(point) {
    this.filter = [];
    point.active = !point.active;
    this.filter = Object.values(this.statistic.points).filter(elem => elem.active).map(elem => elem.status);
    if (this.untestedPoint.active) {
      this.filter.push(0);
    }
    this.get_selected_object();
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
          this.runs = this.runs.filter(currentRun => currentRun.id !== result.id);
          const object = this.suites.find(suite => suite.name === result.name);
          this.merge_suites_and_runs();
          this.select_object(object);
          this.get_statistic();
        } else {
          this.suites = this.suites.filter(currentSuite => currentSuite.id !== result.id);
          this.router.navigate([this.router.url.replace(/\/suite.*/, '')]);
          this.merge_suites_and_runs();
          this.get_statistic();
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
    if (this.selected_object === object || object.id === 0) {
      return;
    }
    this.selected_object = object;
    this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/' + this.selected_object.path + '/' + this.selected_object.id]);
  }

  get_selected_object() {
    const part_of_url = /(run|suite)\/(\d+)/.exec(this.router.url);
    if (part_of_url) {
      this.selected_object = this.runs_and_suites.find(element => element.path == part_of_url[1] && element.id == part_of_url[2]);
    } else {
      this.selected_object = new Run(null);
    }
  }

  make_run() {
    const creatingRunPromise = this.palladiumApiService.create_run(this.object_for_settings.name, this.stance.planId());
    const newRun = new Run(null);
    newRun.name = this.object_for_settings.name;
    newRun.statistic = new Statistic({});
    this.runs.push(newRun);
    if (this.selected_object.name === this.object_for_settings.name) {
      this.selected_object = newRun;
    }
    this.merge_suites_and_runs();
    this.cd.detectChanges();
    creatingRunPromise.then(result => {
      const obj = this.runs_and_suites.find(object => object.name === result.name);
      obj.id = result.id;
      obj.created_at = result.created_at;
      obj.updated_at = result.updated_at;
      if (this.selected_object.name === obj.name) {
        this.selected_object = obj;
      }
      this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/' + this.selected_object.path + '/' + this.selected_object.id]);
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.cd.detach();
  }

  log(a) {
    console.log(a)
  }
}

@Component({
  selector: 'app-runs-settings',
  templateUrl: 'runs-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunsSettingsComponent implements OnInit {
  object;
  object_form = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private router: Router, @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.object_form.patchValue({name: this.object.name});
  }

  get name() {
    return this.object_form.get('name');
  }

  edit_object() {
    if (this.name.value !== this.object.name) {
      this.editing();
    }
    this.dialogRef.close();
  }

  editing() {
    if (this.run_opened) {
      this.ApiService.edit_suite_by_run_id(this.object.id, this.name.value).then((suite: Suite) => {
        this.object.name = suite.name;
        this.object.updated_at = suite.updated_at;
      });
    } else {
      this.ApiService.edit_suite(this.object.id, this.object.name).then((suite: Suite) => {
        this.object.name = suite.name;
        this.object.updated_at = suite.updated_at;
      });
    }
  }

  async delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object.path === 'run') {
        await this.ApiService.delete_run(this.object.id);
      } else {
        await this.ApiService.delete_suite(this.object.id);
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
    return this.data.suites.some(suite => suite.name == this.name.value);
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
