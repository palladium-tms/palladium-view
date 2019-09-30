import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseHistoryComponent implements OnInit, OnDestroy {
  history;
  statuses;
  loading = true;
  resultsData = {};
  params;
  constructor( private activatedRoute: ActivatedRoute, private location: Location,
               private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.params = this.activatedRoute.params.subscribe((params: Params) => {
      this.init_data(params['id']);
      this.cd.detectChanges();
    });

    this.palladiumApiService.statusObservable.subscribe(() => {
      this.statuses = Object.values(this.palladiumApiService.statuses);
      this.cd.detectChanges();
    });
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
    this.cd.detach();
    this.params.unsubscribe();
  }
}
