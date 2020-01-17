import {Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Result} from '../models/result';
import {Params, Router, ActivatedRoute} from '@angular/router';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import {ResultService} from '../../services/result.service';
import {Observable} from 'rxjs';
import {ResultSet} from '../models/result_set';
import {StanceService} from '../../services/stance.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultsComponent implements OnInit, OnDestroy {
  activeRoute$: Observable<number>;
  statuses$: Observable<StructuredStatuses>;
  results$: Observable<Result[]>;
  timeZoneOffset$: Observable<string>;

  statuses;
  loading = false;
  news;
  params;
  resultSetId;
  timeZone;
  constructor(private palladiumApiService: PalladiumApiService, private resultservice: ResultService,
              private activatedRoute: ActivatedRoute, private router: Router,  private cd: ChangeDetectorRef, private stance: StanceService) {}

  ngOnInit() {
    this.activeRoute$ = this.activatedRoute.params.pluck('id').map(id => +id);
    this.statuses$ = this.palladiumApiService.statuses$;

    this.activeRoute$.map(id => {
      this.results$ = this.palladiumApiService.results$.map(results => results[id]);
      this.results$.map(x => {
        console.log('asdasd')
      }).subscribe();
      this.palladiumApiService.get_results(id);
    }).subscribe();


    //
    // this.news = this.resultservice.news().subscribe(data => {
    //   this.add_result(data['result']);
    //   this.cd.detectChanges();
    // });
    this.timeZoneOffset$ = this.palladiumApiService.userSettings.timeZone.map(timezone => {
      return this.palladiumApiService.timeZoneOffset(timezone);
    });
  }

  ngOnDestroy() {
    // this.cd.detach();
    // this.news.unsubscribe();
    // this.params.unsubscribe();
  }
}
