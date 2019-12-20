import {ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Statistic} from '../models/statistic';
import {StanceService} from '../../services/stance.service';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import {Observable, ReplaySubject} from "rxjs";
import {Product} from "../models/product";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class StatisticComponent implements OnInit {
  @Input() statistic$: ReplaySubject<Statistic>;
  @Input() isArchived: boolean;
  statistic: Observable<Statistic>;
  statuses: Observable<StructuredStatuses>;
  caseCount;

  constructor(public stance: StanceService,
              public palladiumApiService: PalladiumApiService) { }

  ngOnInit() {
    this.statuses = this.palladiumApiService.statuses$.pipe();
    this.caseCount = this.palladiumApiService.products$.switchMap((products: Product[]) => {
      const product = products.find(product => product.id === this.stance.productId());
      return product.caseCount$;
    });
  }
}
