import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {PalladiumApiService, StructuredStatuses} from '../../../services/palladium-api.service';
import {Observable} from "rxjs";
import {PointActivityInterface} from '../../models/statistic';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusFilterComponent implements OnInit {
  @Input() pointActivity: PointActivityInterface;
  selected: boolean;
  statuses$: Observable<StructuredStatuses>;

  constructor(private palladiumApi: PalladiumApiService, private cd: ChangeDetectorRef) { }


  ngOnInit() {
    this.statuses$ = this.palladiumApi.statuses$.pipe();
  }
}
