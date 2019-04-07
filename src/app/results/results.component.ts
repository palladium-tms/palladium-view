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
  statuses_formated = {};
  loading = false;
  news;
  params;
  constructor(private palladiumApiService: PalladiumApiService, private resultservice: ResultService,
              private activatedRoute: ActivatedRoute, private router: Router,  private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.params = this.activatedRoute.params.subscribe((params: Params) => { this.init_results(); });
    this.news = this.resultservice.news().subscribe(data => {
      this.add_result(data['result']);
    });
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
        this.statuses_formated[status.id] = {color: status.color, name: status.name};
      });
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  get_statuses() {
    return this.palladiumApiService.get_statuses().then(res => { return res; });
  }

  async get_results() {
    const result_set_id = this.router.url.match(/result_set\/(\d+)/i)[1];
    return await this.palladiumApiService.results(result_set_id);
  }

  ngOnDestroy() {
    this.cd.detach();
    this.news.unsubscribe();
    this.params.unsubscribe();
  }
}
