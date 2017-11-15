export class History {
  plan_id: number;
  plan_name: number;
  run_id: string;
  updated_at: string;
  suite_id: string;
  result_set_id: number;
  statistic: any;
  status: any;
  all_statistic: any = {'all': 0, 'lost': 0, 'attitude': 0};

  constructor(object) {
    this.plan_id = object['plan_id'];
    this.updated_at = object['updated_at'];
    this.plan_name = object['plan_name'];
    this.run_id = this.get_if_exist(object['run_id']);
    this.suite_id = this.get_if_exist(object['suite_id']);
    this.status = object['status'];
    this.result_set_id = this.get_if_exist(object['result_set_id']);
    this.statistic = this.get_if_exist(object['statistic']);
  }

  get_if_exist(object) {
    if (object) {
      return object;
    }
  }
}
