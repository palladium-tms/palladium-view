import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Point, PointActivityInterface, Statistic } from '../../models/statistic';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-status-filter-bar',
  templateUrl: './status-filter-bar.component.html'
})

export class StatusFilterBarComponent implements OnInit {
  @Input() statistic$: Observable<Statistic>;
  @Input() caseCount$: BehaviorSubject<number>;
  @Output() selected = new EventEmitter<number[]>();
  pointsActivity: PointActivityInterface[] = [];
  pointsActivityCache = {};
  pointsActivity$: Observable<PointActivityInterface[]>;
  untestedPointActivity: PointActivityInterface;

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.init_point_activity();
  }

  init_point_activity() {
    this.pointsActivity$ = this.statistic$.pipe(switchMap(statistic => {
      return this.caseCount$.pipe(map(caseCount => {
        this.update_pointsActivityCache();
        this.pointsActivity = [];
        let allResults = 0;
        this.unactivate_empty_activity_from_cache(statistic);
        statistic.points.forEach(point => {
          allResults += point.count;
          this.pointsActivity.push({ point, active: this.pointsActivityCache[point.status] });
        });
        const newUntestedPoint = new Point(0, caseCount - allResults, caseCount);
        this.untestedPointActivity = { point: newUntestedPoint, active: this.untested_is_active() };
        if (this.untestedPointActivity?.point?.count === 0) {
          this.untestedPointActivity.active = false;
        }
        this.clear_empty_filter();
        return this.pointsActivity;
      }));
    }));
  }

  unactivate_empty_activity_from_cache(statistic: Statistic): void {
    Object.keys(this.pointsActivityCache).forEach(statusKeyId => {
      if (statistic.existedStatuses.indexOf(statusKeyId) === -1) {
        this.pointsActivityCache[statusKeyId] = false;
      }
    })
  }

  select_filter(pointActivity: PointActivityInterface): void {
    pointActivity.active = !pointActivity.active;
    const _filter = this.pointsActivity.filter(key => key.active).map(pointActivity => pointActivity.point.status);
    if (this.untestedPointActivity.active) {
      _filter.push(0);
    }
    this.selected.emit(_filter);
    this.cd.detectChanges();
  }

  untested_is_active(): boolean {
    return !!this.untestedPointActivity?.active;
  }

  update_pointsActivityCache() {
    this.pointsActivity.forEach(act => {
      this.pointsActivityCache[act.point.status] = act.active;
    });
  }

  clear_empty_filter() {
    const _filter = this.pointsActivity.filter(key => key.active).map(pointActivity => pointActivity.point.status);
    if (this.untestedPointActivity.active) {
      _filter.push(0);
    }
    this.selected.emit(_filter);
  }
}
