import {ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Statistic} from '../models/statistic';
import {StanceService} from '../../services/stance.service';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class StatisticComponent implements OnInit {
  @Input() statistic$: Promise<Statistic>;
  @Input() isArchived: boolean;
  statistic: Statistic;
  statuses;

  constructor(public stance: StanceService,
              public palladiumApiService: PalladiumApiService,
              private cd: ChangeDetectorRef) { }

  async ngOnInit() {
    this.statistic = await this.statistic$;
    this.palladiumApiService.statuses$.map(statuses => {
      this.statuses = statuses;
      this.cd.detectChanges();
    }).subscribe();

    this.cd.detectChanges();
  }
}
