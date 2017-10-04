import {Statistic} from './statistic';

export class Run {
  id: number;
  name: string;
  plan_id: number;
  created_at: number;
  updated_at: number;
  statistic: any = [];
  suite_constructor = false;
  all_statistic: any = {'all': 0, 'lost': 0, 'attitude': 0};
  fstatistic: Statistic;
  constructor (run) {
    if (run === null) {
      this.create_default_run();
    } else if (run.constructor.name === 'Suite') {
      this.create_run_by_suite(run);
    } else {
      this.id = run['id'];
      this.name = run['name'];
      this.plan_id = run['plan_id'];
      this.created_at = run['created_at'];
      this.updated_at = run['updated_at'];
      this.statistic = new Statistic(run['statistic']);
      // this.statistic = run['statistic'];
      // console.log(run['statistic']);
      // this.fstatistic = new Statistic(run['statistic']);
      this.get_statistic();
    }
  }
  create_default_run() {
    this.id = 0;
    this.name = 'name_loading';
    this.plan_id = 0;
    this.created_at = 0;
    this.updated_at = 0;
    this.statistic = [];
  }
  create_run_by_suite(suite) {
    this.id = suite.id;
    this.name = suite.name;
    this.plan_id = 0;
    this.created_at = 0;
    this.updated_at = 0;
    this.suite_constructor = true;
    this.statistic = [suite.statistic];
  }
  get_statistic() {
    this.all_statistic = {'all': 0, 'lost': 0, 'attitude': 0};
    for (const one_status_data of this.statistic) {
        this.all_statistic['all'] += one_status_data['count'];
        if (one_status_data.status === 0) {
          this.all_statistic['lost'] = one_status_data['count'];
        }
      }
    this.all_statistic['attitude'] = (1 - this.all_statistic['lost'] / this.all_statistic['all']);
  }
}
