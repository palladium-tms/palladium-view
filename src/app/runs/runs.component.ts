import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Run} from '../models/run';
import {Suite} from '../models/suite';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {StatisticService} from '../../services/statistic.service';
import {Statistic} from '../models/statistic';
import {FiltersComponent} from '../page-component/filters/filters.component';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [StatisticService]
})
export class RunsComponent implements OnInit {
  @ViewChild('Filter')
  @ViewChild('Modal') Modal;
  @ViewChild('form') form;
  Filter: FiltersComponent;
  suites = [];
  runs = [];
  runs_and_suites = [];
  plan_id;
  statuses;
  object;
  statistic: Statistic;
  filter = [];
  loading = false;

  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private router: Router, public StatisticService: StatisticService) {
  }

  ngOnInit() {
    this.set_default_filter();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.plan_id = params['id'];
      this.get_runs_and_suites();
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

  set_default_filter() {
    this.activatedRoute.queryParams.subscribe(params => {
      let filter;
      filter = params['filter'];
      if (!(filter instanceof Array)) {
        filter = [filter];
      }
      if (filter[0]) {
        filter.forEach(f => {
          this.filter.push(+f);
        });
      }
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses().then(res => {
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

  get_runs_and_suites() {
    this.runs_and_suites = [];
    this.loading = true;
    Promise.all([this.get_runs(this.plan_id), this.get_suites(), this.get_statuses()]).then(res => {
      this.statuses = res[2];
      this.suites = res[1];
      this.runs = res[0];
      this.merge_suites_and_runs();
      this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
      this.loading = false;
    });
  }
  merge_suites_and_runs() {
    const suite_for_add = [];
    this.suites.forEach(suite => {
      const same = this.runs.filter(run => run.name === suite.name);
      if (same.length === 0) {
        suite_for_add.push(suite);
      } else if (same[0].statistic.all !== suite.statistic.all) {
        const untested = suite.statistic.all - same[0].statistic.all;
        same[0].statistic.add_status('0', untested);
      }
    });
    this.runs_and_suites = this.runs.concat(suite_for_add);
  }

  get_filters(e) {
    this.filter = [];
    this.statuses = e;
    this.statuses.forEach(status => {
      if (status.active) {
        this.filter.push(status.id);
      }
    });
    this.check_selected_is_hidden(this.filter);
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

  edit_object_modal(form: NgForm, modal) {
    if (this.run_opened()) {
      this.ApiService.edit_suite_by_run_id(this.object.id, form.value['name']).then((suite: Suite) => {
        const edited = this.runs_and_suites[this.runs_and_suites.indexOf(this.runs_and_suites.filter(it => it.id === this.object.id)[0])];
        edited.name = suite.name;
        edited.updated_at = suite.updated_at;
      });
    } else {
      this.ApiService.edit_suite(this.object.id, form.value['name']).then((suite: Suite)  => {
        const edited = this.runs_and_suites[this.runs_and_suites.indexOf(this.runs_and_suites.filter(it => it.id === this.object.id)[0])];
        edited.name = suite.name;
        edited.updated_at = suite.updated_at;
      });
    }
    modal.close();
  }
  delete_object() {
    if (confirm('A u shuare?')) {
      const id = this.get_items_id();
      if (this.run_opened()) {
        this.ApiService.delete_run(id).then(run => {
          this.runs = this.runs.filter(current_run => current_run.id !== +run);
          this.merge_suites_and_runs();
          this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
          if (this.router.url.indexOf('/run/' + id) >= 0) {
            this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
          }
        });
      } else {
        this.ApiService.delete_suite(id).then((suite: Suite) => {
          this.suites = this.suites.filter(obj => (obj.id !== suite.id));
          this.merge_suites_and_runs();
          this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
          if (this.router.url.indexOf('/suite/' + id) >= 0) {
            this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]]);
          }
        });
      }
    }
    this.Modal.close();
  }
  open_modal() {
    this.object = this.runs_and_suites.filter(current_object => current_object.id === this.get_items_id() &&
      current_object.path === this.opened_item())[0];
    this.form.controls['name'].setValue(this.object.name);
    this.Modal.open();
  };

  toolbar_opened() {
    return (this.run_opened() || this.suite_opened());
  }
  run_opened() {
    return this.router.url.indexOf('run') >= 0;
  }
  suite_opened() {
    return this.router.url.indexOf('suite') >= 0;
  }
  opened_item() {
    if (this.run_opened()) {
      return ('./run');
    } else {
      return ('./suite');
    }
  }

  get_items_id() {
    if (this.run_opened()) {
      return ( +/run\/(\d+)/.exec(this.router.url)[1]);
    } else {
      return ( +/suite\/(\d+)/.exec(this.router.url)[1]);
    }
  }
}
