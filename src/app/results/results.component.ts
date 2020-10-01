import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Result } from '../models/result';
import { ActivatedRoute } from '@angular/router';
import { PalladiumApiService, StructuredStatuses } from '../../services/palladium-api.service';
import { Observable, Subject } from 'rxjs';
import { map, pluck, switchMap, take, takeUntil } from "rxjs/operators";
import { MatTabGroup } from "@angular/material/tabs";
import { StanceService } from 'services/stance.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultsComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  activeRoute$: Observable<number>;
  statuses$: Observable<StructuredStatuses>;
  results$: Observable<Result[]>;
  timeZoneOffset$: Observable<string>;
  loading = false;
  @ViewChild("tabs", { static: false }) tabs: MatTabGroup;

  constructor(private palladiumApiService: PalladiumApiService,
    private activatedRoute: ActivatedRoute,
    private stance: StanceService,
    private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute$ = this.activatedRoute.params.pipe(pluck('id'), map(id => +id));
    this.statuses$ = this.palladiumApiService.statuses$;

    this.activeRoute$.pipe(map(
      id => {
        this.open_result_tab(this.tabs);
        this.cd.detectChanges();
        this.loading = true;
        this.palladiumApiService.get_results(id);
        return id;
      }), switchMap(resultSetId => {
        return this.palladiumApiService.plans$.pipe(switchMap(allPlans => {
          const plans = allPlans[this.stance.productId()];
          const plan = plans.find(plan => plan.id === this.stance.planId());
          return plan.runs$.pipe(switchMap(runs => {
            let run = runs.find(run => run.id === this.stance.runId())
            return run.resultSets$.pipe(map(resultSets => {
              this.results$ = resultSets.find(resultSet => resultSet.id === resultSetId)?.results$
              this.results$.pipe(take(1)).subscribe(() => this.loading = false)
            }));
          }))
        }));
      })).pipe(takeUntil(this.unsubscribe)).subscribe(() => this.cd.detectChanges());


    this.timeZoneOffset$ = this.palladiumApiService.userSettings.timeZone.pipe(map(timezone => {
      return this.palladiumApiService.timeZoneOffset(timezone);
    }));
  }

  open_history_page($event) {
    if ($event.index === 1) {
      this.palladiumApiService.get_history({ result_set_id: this.activatedRoute.snapshot.params['id'] });
    }
  }

  open_result_tab(tabGroup: MatTabGroup) {
    if (!tabGroup || !(tabGroup instanceof MatTabGroup) || (tabGroup.selectedIndex === 0)) return;
    tabGroup.selectedIndex = 0;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
