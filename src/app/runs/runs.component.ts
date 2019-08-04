import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Suite} from '../models/suite';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {StanceService} from '../../services/stance.service';
import {Statistic} from '../models/statistic';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {ProductSettingsComponent} from '../products/products.component';
import {Run} from '../models/run';

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
  plan_id;
  statuses;
  params;
  object;
  ResultSetComponent;
  statistic: Statistic;
  filter: number[] = []; // ids of active statuses
  loading = false;
  all_statistic = {};
  selected_object: Run;
  object_for_settings;

  constructor(private ApiService: PalladiumApiService,
              private stance: StanceService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private statistic_service: StatisticService,
              private dialog: MatDialog,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.params = this.activatedRoute.params.subscribe((params: Params) => {
      this.get_runs_and_suites();
    });
    this.statistic_service.statistic_has_changed().subscribe(statistic => {
      if (this.runs_and_suites.length === 0) {return}
      this.runs_and_suites.filter(object => this.stance.run_or_suite_by_url(object))[0].statistic = statistic;
      this.statistic = this.statistic_service.runs_and_suites_statistic(this.runs_and_suites);
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses().then(res => {
      return res;
    });
  }

  get_runs(planId) {
    return this.ApiService.get_runs(planId).then(runs => {
      return runs;
    });
  }

  async get_suites() {
    await this.ApiService.get_suites(this.stance.productId());
    return this.ApiService.suites[this.stance.productId()];
  }

  get_runs_and_suites() {
    this.runs_and_suites = [];
    this.loading = true;
    this.cd.detectChanges();
    Promise.all([this.get_runs(this.stance.planId()), this.get_suites(), this.get_statuses()]).then(res => {
      this.statuses = res[2];
      this.suites = res[1];
      this.runs = res[0][this.stance.planId()];
      this.merge_suites_and_runs();
      this.statistic = this.statistic_service.runs_and_suites_statistic(this.runs_and_suites);
      this.all_statistic = this.statistic.extended;
      this.loading = false;
      this.get_selected_object();
      this.get_filters();
      this.cd.detectChanges();
    });
  }

  update_click() {
    this.get_runs_and_suites();
    if (this.ResultSetComponent && this.stance.runId()) {
      this.ResultSetComponent.update_click();
    }
  }

  merge_suites_and_runs() {
    const suite_for_add = [];
    this.suites.forEach(suite => {
      const same = this.runs.filter(run => run.name === suite.name);
      if (same.length === 0) {
        suite_for_add.push(suite);
      } else if (same[0].statistic.all !== suite.statistic.all) {
        const untested = suite.statistic.all - same[0].statistic.all;
        same[0].statistic.add_status(0, untested);
      }
    });
    this.runs_and_suites = this.runs.concat(suite_for_add);
  }

  select_filter(status) {
    status.active = !status.active;
    this.filter = this.statuses.filter(elem => elem.active).map(elem => elem.id);
    this.check_selected_is_hidden();
    this.get_selected_object();
  }

  get_filters() {
    this.statuses.forEach(elem => {
      if (this.filter.includes(elem.id)) {
        elem.active = true;
      }
    });
  }

  check_selected_is_hidden() {
    if (this.stance.suiteId()) {
      this.suite_selected(this.filter);
    } else if (this.stance.runId()) {
      this.run_selected(this.filter);
    }
  }

  suite_selected(filters) {
    const object = this.runs_and_suites.filter(obj => this.stance.is_current_suite(obj))[0];
    if (!object.statistic.has_statuses(filters)) {
      this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]]);
    }
  }

  run_selected(filters) {
    const object = this.runs_and_suites.filter(obj => this.stance.is_current_run(obj))[0];
    if (!object.statistic.has_statuses(filters)) {
      this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
    }
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
        if (this.stance.runId) {
          this.runs = this.runs.filter(current_run => current_run.id !== result.id);
          const path = this.router.url.replace(/run.*/, 'suite/');
          this.router.navigate([ path + this.suites.find(suite => suite.name == result.name).id]);
        } else {
          this.suites = this.suites.filter(obj => (obj.id !== result.id));
          this.router.navigate([ this.router.url.replace(/\/suite.*/, '')]);
        }
        this.merge_suites_and_runs();
        this.statistic = this.statistic_service.runs_and_suites_statistic(this.runs_and_suites);
      }
      this.cd.detectChanges();
    });
  }

  onActivate(componentRef) {
    this.ResultSetComponent = componentRef;
  }

  replace_to_run($event) {
    this.runs.push($event[1]);
    this.merge_suites_and_runs();
    this.statistic = this.statistic_service.runs_and_suites_statistic(this.runs_and_suites);
    if (this.router.url.indexOf('/suite/' + $event[0].id) >= 0) {
      this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0] + 'run/' + $event[1].id]);
    }
  }

  clicked(event, object) {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      this.select_object(object);
    }
  }

  select_object(object) {
    this.selected_object = object;
    this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/' + this.selected_object.path + '/' + this.selected_object.id]);
  }

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === +id);
  }

  get_selected_object() {
    const part_of_url = /(run|suite)\/(\d+)/.exec(this.router.url);
    if (part_of_url) {
      this.selected_object = this.runs_and_suites.find(element => element.path == part_of_url[1] && element.id == part_of_url[2]);
    } else {
      this.selected_object = new Run(null)
    }
  }

  ngOnDestroy() {
    this.cd.detach();
    this.params.unsubscribe();
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
      })
    } else {
      this.ApiService.edit_suite(this.object.id, this.object.name).then((suite: Suite) => {
        this.object.name = suite.name;
        this.object.updated_at = suite.updated_at;
      })
    }
  }

  async delete_object() {
    if (confirm('A u shuare?')) {
      if (this.run_opened()) {
        await this.ApiService.delete_run(this.object.id);
      } else {
        await this.ApiService.delete_suite(this.object.id)
      }
      this.dialogRef.close(this.object);
    }
  }

  run_opened() {
    return this.router.url.indexOf('run') >= 0;
  }

  name_is_existed() {
    if (this.name_is_not_changed()) {
      return false
    }
    return this.data.suites.some(suite => suite.name == this.name.value)
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
