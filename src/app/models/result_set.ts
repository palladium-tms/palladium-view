export class ResultSet {
  id: number;
  name: string;
  status: number;
  run_id: string;
  created_at: number;
  updated_at: number;
  path = 'result_set';
  selected = false;
  active = false;
  constructor(result_set) {
    if (result_set === null) {
      // this.create_default_result_set();
    } else if (result_set.constructor.name === 'Case') {
      this.create_result_set_by_case(result_set);
    } else {
      this.id = result_set['id'];
      this.name = result_set['name'];
      this.run_id = result_set['plan_id'];
      this.status = result_set['status'];
      this.created_at = result_set['created_at'];
      this.updated_at = result_set['updated_at'];
    }
  }

  create_result_set_by_case(this_case) {
    this.id = this_case['id'];
    this.name = this_case['name'];
    this.run_id = this_case['plan_id'];
    this.status = this_case['status'];
    this.created_at = this_case['created_at'];
    this.updated_at = this_case['updated_at'];
  }
}
