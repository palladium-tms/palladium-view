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
  statusesFormated = {};
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
    });
    this.timeZone = await this.palladiumApiService.timezoneOffset();
  }

  add_result(data) {
    this.results.unshift(new Result(data));
  }

  init_results() {
    this.loading = true;
    this.cd.detectChanges();
    Promise.all([this.get_statuses(), this.get_results()]).then(res => {
      this.results = res[1];
      this.statuses = res[0];
      this.statuses.forEach(status => {
        this.statusesFormated[status.id] = {color: status.color, name: status.name};
      });
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  get_statuses() {
    return this.palladiumApiService.get_statuses().then(res => res);
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
