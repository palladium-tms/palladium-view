import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {Statistic} from '../models/statistic';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class StatisticComponent implements OnInit {
  @Input() statistic$: ReplaySubject<Statistic>;
  @Input() filter: number[] = [];
  @Input() caseCount$: ReplaySubject<number>;
  statuses: Observable<StructuredStatuses>;


  constructor(private palladiumApiService: PalladiumApiService) { }

  ngOnInit(): void {
    this.statuses = this.palladiumApiService.statuses$.pipe();
  }

}
