import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Run} from '../models/run';
import {Suite} from '../models/suite';
import {NavigationEnd, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {Statistic} from '../models/statistic';
import {FiltersComponent} from '../page-component/filters/filters.component';
declare var $: any;
@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css'],
  providers: [StatisticService]
})
export class RunsComponent implements OnInit, AfterViewInit {
  @ViewChild('Filter')
  Filter: FiltersComponent;
  suites = [];
  runs_and_suites = [];
  statuses;
  run_settings_data = {};
  statistic: Statistic;
  filter = [];

  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private router: Router, public StatisticService: StatisticService) {
  }

  ngOnInit() {
    this.set_default_filter();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.get_runs_and_suites(params['id']);
    });
    if (this.router.url.indexOf('/suite/') >= 0 || this.router.url.indexOf('/run/') >= 0 && this.router.url.indexOf('/result_set/') <= 0) {
      $('.product-space').removeClass('very-big-column small-column').addClass('big-column');
      $('.plan-space').removeClass('small-column very-big-column').addClass('big-column');
      $('.run-space').removeClass('big-column small-column').addClass('very-big-column');
    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url.indexOf('/suite/') >= 0 || this.router.url.indexOf('/run/') >= 0
          && this.router.url.indexOf('/result_set/') <= 0) {
          this.set_space_width();
        }
      }
    });
    this.StatisticService.getMessage().subscribe(statistic => {
      const id = this.router.url.match(/run\/(\d+)/i)[1];
      if (id !== null) {
        Object(this.runs_and_suites).forEach(obj => {
          if (obj.constructor.name === 'Run' && obj.id === +id) {
            obj.statistic = statistic;
          }
        });
        this.statistic = statistic;
        this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
      }
    });
  }

  ngAfterViewInit() {
    $('.runs-list').css('height', $('#main-container').innerHeight() - ($('.filter_block').outerHeight(true) * 2 + 11));
  }

  set_default_filter() {
    this.activatedRoute.queryParams.subscribe(params => {
      let filter;
      filter = params['filter'];
      if (!(filter instanceof Array)) {
        filter = [filter];
      }
      if (filter[0]) {
        filter.forEach( f => {
          this.filter.push(+f);
        });
      }
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses().then(res => {
      res[0] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      return res;
    });
  }

  get_runs(plan_id) {
    return this.ApiService.get_runs(plan_id).then(runs => {
      return runs;
    });
  }

  get_suites() {
    const product_id = this.router.url.match(/product\/(\d+)/i)[1];
    return this.ApiService.get_suites(product_id).then(suites => {
      return suites;
    });
  }

  get_runs_and_suites(plan_id) {
    Promise.all([this.get_runs(plan_id), this.get_suites(), this.get_statuses()]).then(res => {
      this.statuses = res[2];
      const suite_for_add = [];
      res[1].forEach(suite => {
        this.suites.push(suite);
        const same = res[0].filter(run => run.name === suite.name);
        if (same.length === 0) {
          suite_for_add.push(suite);
        } else if (same[0].statistic.all !== suite.statistic.all) {
          const untested = suite.statistic.all - same[0].statistic.all;
          same[0].statistic.add_status('0', untested);
        }
      });
      this.runs_and_suites = res[0].concat(suite_for_add);
      this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
    });
  }

  get_filters(e) {
    this.filter = e;
    this.check_selected_is_hidden(e);
  }

  check_selected_is_hidden(filters) {
    if (this.router.url.indexOf('/suite/') >= 0) {
      this.suite_selected(filters);
    } else if (this.router.url.indexOf('/run/') >= 0) {
      this.run_selected(filters);
    }
  }

  suite_selected(filters) {
    const id = this.router.url.match(/suite\/(\d+)/i)[1];
    const object = this.runs_and_suites.filter(obj => obj.constructor.name === 'Suite' && obj.id === +id)[0];
    if (!object.statistic.has_statuses(filters)) {
      this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]]);
    }
  }

  run_selected(filters) {
    const id = this.router.url.match(/run\/(\d+)/i)[1];
    const object = this.runs_and_suites.filter(obj => obj.constructor.name === 'Run' && obj.id === +id)[0];
    if (!object.statistic.has_statuses(filters)) {
      this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
    }
  }

  log(val) {
    console.log(val);
  }

  set_space_width() {
    if (this.router.url.indexOf('/result_set/') === -1 && !$('.run-space').hasClass( 'big-column')) {
      $('.product-space').removeClass('very-big-column').addClass('big-column');
      $('.plan-space').removeClass('very-big-column').addClass('big-column');
      $('.run-space').removeClass('big-column').addClass('very-big-column');
    } else {
      $('.product-space').removeClass('very-big-column').addClass('small-column');
      $('.run-space').removeClass('very-big-column').addClass('big-column');
      $('.plan-space').removeClass('very-big-column').addClass('small-column ');
    }
  }

  result_object(event) {
    if (event.status === 'run_deleted') {
      this.runs_and_suites[event.index] = this.suites.filter(
        suite => suite.name === event.object.name)[0];
    } else if (event.status === 'suite_deleted') {
      this.runs_and_suites.splice(this.run_settings_data[event.index], 1);
    }
    this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
  }
}
