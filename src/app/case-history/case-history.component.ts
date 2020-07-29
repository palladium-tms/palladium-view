import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {PalladiumApiService, StructuredResults, StructuredStatuses} from '../../services/palladium-api.service';
import { Observable, BehaviorSubject} from "rxjs";
import {ResultSet} from "../models/result_set";

@Component({
  selector: 'app-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseHistoryComponent implements OnInit {
  history$: Observable<ResultSet[]>;
  statuses$: Observable<StructuredStatuses>;
  results$: BehaviorSubject<StructuredResults>;
  historySliderStatus = {};

  constructor(private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.statuses$ = this.palladiumApiService.statuses$;

    this.history$ = this.palladiumApiService.historyPack$;

    this.results$ = this.palladiumApiService.historyResults$;

  }

  get_results(history) {
    if (this.historySliderStatus[history.id] === 'opened') {
      this.historySliderStatus[history.id] = 'close';
    } else {
      this.historySliderStatus[history.id] = 'loading';
      this.palladiumApiService.get_results_for_history(history.id).subscribe(id => {
        this.historySliderStatus[id] = 'opened';
        this.cd.detectChanges();
      });
    }
  }
}
