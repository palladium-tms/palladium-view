import {Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Result} from '../models/result';
import {ActivatedRoute} from '@angular/router';
import {PalladiumApiService, StructuredResults, StructuredStatuses} from '../../services/palladium-api.service';
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

  constructor(private palladiumApiService: PalladiumApiService,
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

  open_history_page($event) {
    if ($event.index === 1) {
      this.palladiumApiService.get_history({result_set_id: this.activatedRoute.snapshot.params['id']});
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
