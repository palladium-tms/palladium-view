import {Statistic} from './statistic';

export class Run {
  id: number;
  name: string;
  plan_id: number;
  created_at: number;
  updated_at: number;
  statistic: Statistic;
  path = './run';
  constructor (run) {
    if (run === null) {
      this.create_default_run();
    } else {
      this.id = run['id'];
      this.name = run['name'];
      this.plan_id = run['plan_id'];
      this.created_at = run['created_at'];
      this.updated_at = run['updated_at'];
      this.statistic = this.get_statistic(run);
    }
  }
  create_default_run() {
    this.id = 0;
    this.name = 'name_loading';
    this.plan_id = 0;
    this.created_at = 0;
    this.updated_at = 0;
    this.statistic = new Statistic(null);
  }
  get_statistic(data) {
    const stat_data = {};
    data.statistic.forEach(object => {
      stat_data[object['status']] = object['count'];
    });
    return new Statistic(stat_data);
  }
}
