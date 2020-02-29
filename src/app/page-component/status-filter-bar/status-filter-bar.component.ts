import {Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnChanges} from '@angular/core';
import {PointActivityInterface, Statistic} from '../../models/statistic';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-status-filter-bar',
  templateUrl: './status-filter-bar.component.html'
})

export class StatusFilterBarComponent implements OnInit, OnChanges{
  @Input() statistic$: Observable<Statistic>;
  @Input() caseCount$: Observable<number>;
  @Output() selected = new EventEmitter<number[]>();
  pointsActivity: PointActivityInterface[] = [];

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.caseCount$.map(x => console.log(x)).subscribe();
    this.statistic$.map(statistic => {
      this.pointsActivity = [];
      statistic.points.forEach(point => {
        this.pointsActivity.push({point, active: false});
      });
    }).subscribe();
  }

  ngOnChanges() {
    this.statistic$.map(statistic => {
      this.pointsActivity = [];
      statistic.points.forEach(point => {
        this.pointsActivity.push({point, active: false});
      });
    }).subscribe();
  }

  select_filter(point: PointActivityInterface): void {
    point.active = !point.active;
    const _filter = this.pointsActivity.filter(key => key.active).map(pointActivity => pointActivity.point.status);
    this.selected.emit(_filter);
    this.cd.detectChanges();
  }
}
