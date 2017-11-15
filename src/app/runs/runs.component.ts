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
  menuItems = [
    {label: '<span class="menu-icon">Refresh</span>', onClick: this.get_runs_and_suites.bind(this)},
    {label: '<span class="menu-icon">Edit</span>', onClick: this.open_modal.bind(this)},
    {label: '<span class="menu-icon">Delete</span>', onClick: this.delete_object_modal.bind(this)}];
  filter = [];

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

  get_runs_and_suites() {
    Promise.all([this.get_runs(this.plan_id), this.get_suites(), this.get_statuses()]).then(res => {
      this.statuses = res[2];
      this.suites = res[1];
      this.runs = res[0];
      this.merge_suites_and_runs();
      this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
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

  edit_object_modal(form: NgForm, modal) {
    if (this.object.path === './run') {
      this.ApiService.edit_suite_by_run_id(this.object.id, form.value['name']).then(suite => {
        this.runs_and_suites.forEach(object => {
          if (object.id === this.object.id && object.path === './run') {
            object.name = suite.name;
            object.updated_at = suite.updated_at;
          }
        }); // FIXME: need optimize
      });
    } else {
      this.ApiService.edit_suite(this.object.id, form.value['name']).then(suite => {
        this.runs_and_suites.forEach(object => {
          if (object.id === this.object.id && object.path === './suite') {
            object.name = suite.name;
            object.updated_at = suite.updated_at;
          }
        }); // FIXME: need optimize
      });
    }
    modal.close();
  }
  delete_object_modal(object) {
    if (confirm('A u shuare?')) {
      if (object.dataContext.path === './run') {
        this.ApiService.delete_run(object.dataContext.id).then(run => {
          this.runs = this.runs.filter(current_run => current_run.id !== +run);
          this.merge_suites_and_runs();
          this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
          if (this.router.url.indexOf('/run/' + object.dataContext.id) >= 0) {
            this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
          }
        });
      } else {
        this.ApiService.delete_suite(object.dataContext.id).then(suite => {
          const deleted_obj = this.runs_and_suites.filter(obj => (obj.id === suite.id && obj.path === './suite'))[0];
          this.runs_and_suites.splice(this.runs_and_suites.indexOf(deleted_obj), 1);
          this.statistic = this.StatisticService.runs_and_suites_statistic(this.runs_and_suites);
          if (this.router.url.indexOf('/suite/' + object.dataContext.id) >= 0) {
            this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]]);
          }
        });
      }
    }
  }
  open_modal(object) {
    this.object = this.runs_and_suites.filter(current_object => current_object.id === object.dataContext.id &&
      current_object.path === object.dataContext.path)[0];
    this.form.controls['name'].setValue(this.object.name);
    this.Modal.open();
  };
}
