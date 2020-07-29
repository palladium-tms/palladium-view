import {Component, Input, OnChanges, OnInit, ViewEncapsulation} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {Point, Statistic} from '../models/statistic';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class StatisticComponent implements OnInit, OnChanges {
  @Input() statistic$: ReplaySubject<Statistic>;
  @Input() filter: number[] = [];
  @Input() caseCount$: ReplaySubject<number>;
  statuses: Observable<StructuredStatuses>;
  untestedPoint: Point;


  constructor(private palladiumApiService: PalladiumApiService) { }

  ngOnInit(): void {
    this.statuses = this.palladiumApiService.statuses$.pipe();
    this.statistic$?.subscribe(() => {
      this.get_untested_point();
    });
    this.caseCount$.subscribe(_ =>{
      this.get_untested_point();
    });
  }

  ngOnChanges() {
    this.get_untested_point();
  }

  get_untested_point() {
    if (this.statistic$ && this.caseCount$) {
      //is a run
      this.statistic$.switchMap(statistic => {
        return this.caseCount$.map(caseCount => {
          this.untestedPoint = new Point(0, caseCount - statistic.all, caseCount);
        });
      }).take(1).subscribe();
    } else if (this.caseCount$) {
      // is a suite
      this.caseCount$.take(1).subscribe(caseCount => {
        this.untestedPoint = new Point(0, caseCount, caseCount);
      });
    }
  }
}
