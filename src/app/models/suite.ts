import {BehaviorSubject} from 'rxjs';

export class Suite {
  id: number;
  name: string;
  product_id: number;
  created_at: string;
  updated_at: string;
  caseCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  caseCount: number;
  path = 'suite';
  constructor (suite) {
    if (suite == null) {
      suite = this.create_default_suite();
    } else if (suite.path === 'run') {
      suite = this.create_suite_by_run(suite);
    }
    this.id = suite['id'];
    this.name = suite['name'];
    this.product_id = suite['product_id'];
    this.created_at = suite['created_at'].split(' +')[0];
    this.updated_at = suite['updated_at'].split(' +')[0];
    if (suite['statistic']) {
      this.caseCount = suite['statistic'][0]['count'];
      this.caseCount$.next(this.caseCount);
    }
  }
  create_default_suite() {
    return {'id': 'id_loading', 'name': 'name_loading', 'path': 'suite',
      'product_id': 'product_id_loading',
      'created_at': 'created_at_loading', 'updated_at': 'updated_at_loading',
      'statistic': {0: 0}};
  }
  create_suite_by_run(suite) {
    return {'id': suite['id'], 'name': suite['name'], 'path': 'run',
      'product_id': 0,
      'created_at': suite['created_at'].split(' +')[0], 'updated_at': suite['updated_at'].split(' +')[0],
      'statistic': {0: 0}};
  }

  decrease_case_count(value = 1) {
    this.caseCount -= value;
    this.caseCount$.next(this.caseCount);
  }

  is_a(object) {
    return object.name === this.name && object.id === this.id && object.path === this.path;
  }
}
