import {Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnChanges} from '@angular/core';
import {Point, PointActivityInterface, Statistic} from '../../models/statistic';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
  selector: 'app-status-filter-bar',
  templateUrl: './status-filter-bar.component.html'
})

export class StatusFilterBarComponent implements OnInit, OnChanges {
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
    this.caseCount$.subscribe(caseCount => {
      if (this.untestedPointActivity) {
        const resultSetCount = (1/this.untestedPointActivity.point.attitude * this.untestedPointActivity.point.count - this.untestedPointActivity.point.count);
        this.untestedPointActivity = {point: new Point(0, Math.trunc(caseCount - resultSetCount), caseCount), active: this.untested_is_active()};
        this.clear_empty_filter();
      }
    });
  }

  ngOnChanges() {
    this.init_point_activity();
  }

  init_point_activity() {
    this.pointsActivity$ = this.statistic$.map(statistic => {
      this.update_pointsActivityCache();
      this.pointsActivity = [];
      let allResults = 0;
      statistic.points.forEach(point => {
        allResults += point.count;
        this.pointsActivity.push({point, active: this.pointsActivityCache[point.status]});
      });
      this.untestedPointActivity = {point: new Point(0, this.caseCount$.value - allResults, this.caseCount$.value), active: this.untested_is_active()};
      this.clear_empty_filter();
      return this.pointsActivity;
    });
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
    return this.untestedPointActivity?.active;
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
