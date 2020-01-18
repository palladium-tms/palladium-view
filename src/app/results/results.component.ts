import {Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Result} from '../models/result';
import {ActivatedRoute} from '@angular/router';
import {PalladiumApiService, StructuredResults, StructuredStatuses} from '../../services/palladium-api.service';
import {ResultService} from '../../services/result.service';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultsComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  activeRoute$: Observable<number>;
  statuses$: Observable<StructuredStatuses>;
  results$: Observable<Result[]>;
  timeZoneOffset$: Observable<string>;

  constructor(private palladiumApiService: PalladiumApiService, private resultService: ResultService,
              private activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute$ = this.activatedRoute.params.pluck('id').map(id => +id);
    this.statuses$ = this.palladiumApiService.statuses$;

    this.activeRoute$.map(
      id => {
        this.cd.detectChanges();
        this.results$ = this.palladiumApiService.results$.map((results: StructuredResults) => results[id]);
        this.palladiumApiService.get_results(id);
      }).pipe(takeUntil(this.unsubscribe)).subscribe(() => this.cd.detectChanges());


    this.timeZoneOffset$ = this.palladiumApiService.userSettings.timeZone.map(timezone => {
      return this.palladiumApiService.timeZoneOffset(timezone);
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
