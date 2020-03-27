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
  pointsActivity$: Observable<PointActivityInterface[]>;
  untestedPointActivity$: Observable<{ active: boolean; point: Point }>;
  untestedPointActivity: PointActivityInterface;

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit() {}

  ngOnChanges() {
    this.pointsActivity$ = this.statistic$.map(statistic => {
      this.pointsActivity = [];
      let allResults = 0;
      statistic.points.forEach(point => {
        allResults += point.count;
        this.pointsActivity.push({point, active: false});
      });

      this.untestedPointActivity$ = this.caseCount$.map(caseCount => {
        return {point: new Point(0, caseCount - allResults, caseCount), active: false};
      });
      this.untestedPointActivity = {point: new Point(0, this.caseCount$.value - allResults, this.caseCount$.value), active: false};
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
}
