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
  constructor (currentCase) {
    if (currentCase.path === 'result_set') {
      currentCase = this.create_case_by_result_set(currentCase);
    }
    this.id = currentCase['id'];
    this.name = currentCase['name'];
    this.suite_id = currentCase['suite_id'];
    this.created_at = currentCase['created_at'].split(' +')[0];
    this.updated_at = currentCase['updated_at'].split(' +')[0];
  }

  create_case_by_result_set(resultSet) {
    return {'id': resultSet.id, 'name': resultSet.name, 'suite_id': 0,
      'created_at': resultSet.created_at, 'updated_at': resultSet.updated_at};
  }
}
