import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import { Location } from '@angular/common';
import {forkJoin, Observable} from "rxjs";
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
export class CaseHistoryComponent implements OnInit, OnDestroy {
  history$: Observable<ResultSet[]>;
  statuses$: Observable<StructuredStatuses>;

  statuses;
  loading = true;
  resultsData = {};
  params;
  constructor( private activatedRoute: ActivatedRoute, private location: Location,
               private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef, private stance: StanceService) { }

  ngOnInit() {
    this.statuses$ = this.palladiumApiService.statuses$;

    this.history$ = this.palladiumApiService.historyPack$.map((historyPack: StructuredHistoryPack) => {
      const runName = this.palladiumApiService.run_name_by_id(this.stance.runId(), this.stance.planId());
      return historyPack[this.stance.productId()][runName];
    });

    // this.history$ = this.stance.product$.switchMap(product => {
    //   return this.stance.run$.switchMap(run => {
    //     return this.palladiumApiService.historyPack$.map(historyPack => {
    //       historyPack[product.id]
    //     });
    //   });
    //   })

    // this.history$ = this.palladiumApiService.historyPack$.map(historyPack => {
    //
    //   historyPack[this.stance.]
    // });
    //
    // this.params = this.activatedRoute.params.subscribe((params: Params) => {
    //   console.log('asdasd')
    //   this.init_data(params['id']);
    //   this.cd.detectChanges();
    // });
    //
    // this.palladiumApiService.statusObservable.subscribe(() => {
    //   this.statuses = Object.values(this.palladiumApiService.statuses);
    //   this.cd.detectChanges();
    // });
  }

  init_data(id) {
    this.loading = true;
    this.history = [];
    Promise.all([this.get_case_history(id)]).then(res => {
      this.history = res[0];
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  get_case_history(id) {
    return this.palladiumApiService.history(id);
  }

  async get_results(history) {
    if (this.resultsData[history.id] === undefined) {
      history.object_status = 'loading';
      const results = await this.palladiumApiService.results(history.id);
      history.object_status = 'closed';
      this.resultsData[history.id] = {results};
    }
    history.object_status === 'closed' ? history.object_status = 'opened' : history.object_status = 'closed';
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    console.log('asdasd')
    // this.cd.detach();
    // this.params.unsubscribe();
  }
}
