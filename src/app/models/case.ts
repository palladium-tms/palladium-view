export class Case {
  id: number;
  name: string;
  status = 0;
  suite_id: string;
  created_at: number;
  updated_at: number;
  path = 'case';
  selected = false;
  active = false;
  deleting = false;
  constructor (current_case) {
    if (current_case.constructor.name === 'ResultSet') {
      current_case = this.create_case_by_result_set(current_case);
    }
    this.id = current_case['id'];
    this.name = current_case['name'];
    this.suite_id = current_case['suite_id'];
    this.created_at = current_case['created_at'].split(' +')[0];
    this.updated_at = current_case['updated_at'].split(' +')[0];
  }
  create_case_by_result_set(result_set) {
    return {'id': result_set.id, 'name': result_set.name, 'suite_id': 0,
      'created_at': result_set.created_at, 'updated_at': result_set.updated_at};
  }
}
