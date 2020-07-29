import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Suite } from '../models/suite';
import { Router } from '@angular/router';
import { PalladiumApiService, StructuredStatuses } from '../../services/palladium-api.service';
import { StanceService } from '../../services/stance.service';
import { Statistic } from '../models/statistic';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductSettingsComponent } from '../products/products.component';
import { Run } from '../models/run';
import { BehaviorSubject, Observable, ReplaySubject, Subject, merge, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Plan } from 'app/models/plan';

interface untestedSpaceInterface {
  string?: Observable<number>
}

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class RunsComponent implements OnInit, OnDestroy {
  loading = false;
  private unsubscribe: Subject<void> = new Subject();
  runs$: Observable<{}>;
  suites$: Observable<Suite[]>;
  currentPlan: Plan;
  untestedSpace: untestedSpaceInterface;
  activeRoute$: Observable<number>;
  refreshButtonStatus: ('disabled' | 'active') = 'disabled';
  objectForSettings: Run | Suite;
  filteredSuites: Observable<Suite[]>;

  statistic$: ReplaySubject<(Statistic)>;
  caseCount$: BehaviorSubject<(number)> = new BehaviorSubject(0);
  zoroCaseCount$ = new BehaviorSubject(0); // for good statistic if plan is archived
  statuses$: Observable<StructuredStatuses>;
  filter: number[] = []; // ids of active statuses
  filter$: ReplaySubject<number[]> = new ReplaySubject(1); // ids of active statuses
  activeObject: Run | Suite;
  planisArchived = false;

  constructor(private palladiumApiService: PalladiumApiService,
    private stance: StanceService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef) {

    this.filteredSuites = this.filter$.switchMap(filter => {
      return this.suites$.switchMap(suites => {
        return this.runs$.map(runs => {
          let newElementPack = []
          suites.forEach(suite => {
            if (this.contain_filtered_status(runs[suite.name], filter, suite.caseCount) || filter.length == 0) {
              newElementPack.push(suite);
            }
          });
          return newElementPack;
        })
      })
    })
  }

  contain_filtered_status(element, filters, caseCount) {
    if (element) {
      return element?.statistic?.existedStatuses.some((status: number) => filters.indexOf(+status) >= 0) ||
        (caseCount > element?.statistic.all && filters.indexOf(0) > -1);
    } else {
      return filters.indexOf(0) > -1
    }
  }

  ngOnInit() {
    this.activeRoute$ = this.activatedRoute.params.pluck('id').map(id => +id);
    this.statuses$ = this.palladiumApiService.statuses$;

    this.activeRoute$.map((id: number) => {
      this.get_runs(id);
    }).switchMap(() => {
      return this.palladiumApiService.plans$.map(allPlans => {
        const plans = allPlans[this.stance.productId()];
        this.currentPlan = plans.find(plan => plan.id === this.stance.planId());
        this.statistic$ = this.currentPlan.statistic$;
        this.suites$ = this.currentPlan.suites$;

        this.runs$ = this.currentPlan.runs$.map(runs => {
          let object = {};
          runs.forEach(run => {
            object[run.name] = run;
          })
          this.refreshButtonStatus = 'active';
          return object;
        });

        this.caseCount$ = this.currentPlan.caseCount$;
      });
    }).map(() => {
      this.init_active_object();
    }).pipe(takeUntil(this.unsubscribe)).subscribe();
  }

  get_runs(id: number): void {
    this.untestedSpace = {};
    this.palladiumApiService.init_runs(id);
  }

  init_active_object(): void {
    const runId = this.stance.runId();
    this.currentPlan.runs$.take(1).switchMap((runs: Run[]) => {
      return this.suites$.map(suites => {
        const runName = runs.find(run => run.id === +runId)?.name;
        if (runName) {
          this.activeObject = suites.find(suite => suite.name == runName);
        }
      })
    }).subscribe();
  }

  update_click(): void {
    this.refreshButtonStatus = 'disabled';
    this.palladiumApiService.get_runs(this.stance.planId()).subscribe();
    this.cd.detectChanges();
  }

  select_filter(filter: Array<number>): void {
    this.filter = filter;
    this.filter$.next(filter);
  }

  open_settings(): void {
    this.suites$.take(1).switchMap(suites => {
      const dialogRef = this.dialog.open(RunsSettingsComponent, {
        data: {
          object: this.objectForSettings,
          suites,
          plan: this.currentPlan
        }
      });

      return dialogRef.afterClosed().map(() => {
        this.cd.detectChanges();
      });
    }).subscribe();
  }

  clicked(event, object: Run | Suite, suite: Suite): void {
    if (!event.target.classList.contains('mat-icon') && !event.target.classList.contains('mat-icon-button')) {
      this.select_object(object, suite);
    }
  }

  select_object(object: Run | Suite, suite: Suite): void {
    this.activeObject = suite;
    this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/' + object.path + '/' + object.id]);
  }

  make_run(): void {
    this.palladiumApiService.create_run(this.objectForSettings.name, this.stance.planId()).subscribe(run => {
      if (this.stance.suiteId() === this.objectForSettings.id) {
        this.router.navigate([/(.*)plan\/\d+/.exec(this.router.url)[0] + '/run/' + run.id]);
        this.activeObject = run;
      }
    });
  }

  ngOnDestroy() {
    this.cd.detach();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  log() {
    // console.log('x');
  }

  get_untested_space(runs: Run[], suites: Suite[]): void {
    this.untestedSpace = {};
    if (!suites || !runs) { return; }
    suites.map(suite => {
      this.untestedSpace[suite.name] = suite.caseCount$;
    });
  }
}

@Component({
  selector: 'app-runs-settings',
  templateUrl: 'runs-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunsSettingsComponent implements OnInit {
  object: Run | Suite;
  plan: Plan;
  formGroup = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
    private palladiumApiService: PalladiumApiService,
    private router: Router, @Inject(MAT_DIALOG_DATA) public data, private stance: StanceService,) {
  }

  ngOnInit() {
    this.object = this.data.object;
    this.plan = this.data.plan;
    this.formGroup.patchValue({ name: this.object.name });
  }

  get name() {
    return this.formGroup.get('name');
  }

  edit_object(): void {
    if (this.name.value !== this.object.name) {
      this.editing();
    }
    this.dialogRef.close();
  }

  editing(): void {
    if (this.object.path === 'run') {
      this.palladiumApiService.edit_suite_by_run_id(this.object, this.name.value, this.stance.planId());
    } else {
      this.palladiumApiService.edit_suite(this.object.id, this.name.value);
    }
  }

  delete_object() {
    if (confirm('A u shuare?')) {
      if (this.object instanceof Run) {
        this.palladiumApiService.delete_run(this.object, this.plan);
        if (this.stance.runId() === this.object.id) {
          this.router.navigate(['/product/' + this.stance.productId() + '/plan/' + this.stance.planId()]);
        }
      } else {
        this.palladiumApiService.delete_suite(this.object.id, this.plan);
        if (this.stance.suiteId() === this.object.id) {
          this.router.navigate(['/product/' + this.stance.productId() + '/plan/' + this.stance.planId()]);
        }
      }
      this.dialogRef.close(this.object);
    }
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
      this.formGroup.controls['name'].setErrors({ 'is_exist': true });
    }
  }
}
