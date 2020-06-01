import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PalladiumApiService, StructuredResults, StructuredStatuses} from '../../services/palladium-api.service';
import { Location } from '@angular/common';
import { Observable, ReplaySubject} from "rxjs";
import {ResultSet} from "../models/result_set";
import {StanceService} from "../../services/stance.service";
export interface StructuredHistoryPack {
  [key: number]: {[key: string]: ResultSet[]};
}
@Component({
  selector: 'app-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseHistoryComponent implements OnInit {
  history$: Observable<ResultSet[]>;
  statuses$: Observable<StructuredStatuses>;
  results$: ReplaySubject<StructuredResults>;
  historySliderStatus = {};

  statuses;
  params;
  constructor(private activatedRoute: ActivatedRoute, private location: Location,
               private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef, private stance: StanceService) { }

  ngOnInit() {
    this.statuses$ = this.palladiumApiService.statuses$;

    this.history$ = this.palladiumApiService.historyPack$.map((historyPack: StructuredHistoryPack) => {
      const runName = this.palladiumApiService.run_name_by_id(this.stance.runId(), this.stance.planId());
      const currentHistoryPack = historyPack[this.stance.productId()];
      if (currentHistoryPack && currentHistoryPack[runName]) {
        return historyPack[this.stance.productId()][runName];
      } else {
        return [];
      }
    });

    this.results$ = this.palladiumApiService.results$;

  }

  get_results(history) {
    if (this.historySliderStatus[history.id] === 'opened') {
      this.historySliderStatus[history.id] = 'close';
    } else {
      this.historySliderStatus[history.id] = 'loading';
      this.palladiumApiService.get_results_obs(history.id).subscribe(id => {
        this.historySliderStatus[id] = 'opened';
        this.cd.detectChanges();
      });
    }
  }
}
