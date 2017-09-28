export class ResultSet {
  id: number;
  name: string;
  status: number;
  run_id: string;
  created_at: number;
  updated_at: number;

  constructor (result_set) {
    if (result_set === null) {
      // this.create_default_result_set();
    } else if (result_set.constructor.name === 'Case') {
      // this.create_run_by_case(result_set);
    } else {
      this.id = result_set['id'];
      this.name = result_set['name'];
      this.run_id = result_set['plan_id'];
      this.status = result_set['status'];
      this.created_at = result_set['created_at'];
      this.updated_at = result_set['updated_at'];
    }
  }
}
