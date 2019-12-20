import {BehaviorSubject} from 'rxjs';

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
  constructor(resultSet) {
    if (resultSet === null) {
    } else if (resultSet.path === 'case') {
      this.create_result_set_by_case(resultSet);
    } else {
      this.id = resultSet['id'];
      this.name = resultSet['name'];
      this.run_id = resultSet['plan_id'];
      this.status = resultSet['status'];
      this.created_at = resultSet['created_at'].split(' +')[0];
      this.updated_at = resultSet['updated_at'].split(' +')[0];
    }
  }

  create_result_set_by_case(thisCase) {
    this.id = thisCase['id'];
    this.name = thisCase['name'];
    this.run_id = thisCase['plan_id'];
    this.status = thisCase['status'];
    this.created_at = thisCase['created_at'].split(' +')[0];
    this.updated_at = thisCase['updated_at'].split(' +')[0];
  }
}
