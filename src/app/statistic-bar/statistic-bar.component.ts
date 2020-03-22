import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Statistic} from '../models/statistic';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import {Observable, ReplaySubject} from "rxjs";

@Component({
  selector: 'app-statistic-bar',
  templateUrl: './statistic-bar.component.html',
  styleUrls: ['./statistic-bar.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class StatisticBarComponent implements OnInit {
  @Input() statistic$: ReplaySubject<Statistic>;
  @Input() caseCount$: ReplaySubject<number>;
  statuses: Observable<StructuredStatuses>;

  constructor(public palladiumApiService: PalladiumApiService) { }

  ngOnInit() {
    this.statuses = this.palladiumApiService.statuses$.pipe();
  }
}
