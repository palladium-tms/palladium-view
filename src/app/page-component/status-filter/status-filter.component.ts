import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Point} from 'app/models/statistic';
import {PalladiumApiService} from '../../../services/palladium-api.service';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusFilterComponent implements OnInit {
  @Input() point: Point;
  selected: boolean;
  constructor(private palladiumApi: PalladiumApiService) { }

  ngOnInit() {
  }

  get_background_color() {
    if (this.point.active) {
      return this.palladiumApi.statuses[this.point.status].color;
    }
  }
}
