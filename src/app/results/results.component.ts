import {Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Result} from '../models/result';
import {Params, Router, ActivatedRoute} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {ResultService} from '../../services/result.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResultsComponent implements OnInit, OnDestroy {
  results: Result[] = [];
  statuses;
  loading = false;
  news;
  params;
  resultSetId;
  timeZone;
  constructor(private palladiumApiService: PalladiumApiService, private resultservice: ResultService,
              private activatedRoute: ActivatedRoute, private router: Router,  private cd: ChangeDetectorRef) {}

  async ngOnInit() {
    this.params = this.activatedRoute.params.subscribe((params: Params) => {
      this.resultSetId = params.id;
      this.init_results();
    });
    this.news = this.resultservice.news().subscribe(data => {
      this.add_result(data['result']);
      this.cd.detectChanges();
    });
    this.timeZone = await this.palladiumApiService.timezoneOffset();
    this.palladiumApiService.statusObservable.subscribe((statuses) => {
      this.statuses = statuses;
      this.cd.detectChanges();
    });
  }

  add_result(data) {
    this.results.unshift(new Result(data));
  }

  init_results() {
    this.loading = true;
    this.cd.detectChanges();
    Promise.all([this.get_results()]).then(res => {
      this.results = res[0];
      this.loading = false;
      this.cd.detectChanges();
    });
  }


  async get_results() {
    return this.palladiumApiService.results(this.resultSetId);
  }

  ngOnDestroy() {
    this.cd.detach();
    this.news.unsubscribe();
    this.params.unsubscribe();
  }
}
