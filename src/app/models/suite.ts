import {Statistic} from './statistic';
import {ReplaySubject} from 'rxjs';
import {Case} from './case';

export class Suite {
  id: number;
  name: string;
  product_id: number;
  created_at: string;
  updated_at: string;
  cases$: ReplaySubject<Case[]> = new ReplaySubject(1);
  statistic: Statistic;
  statistic$: ReplaySubject<Statistic> = new ReplaySubject(1);
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
    this.statistic = new Statistic({0: suite['statistic'][0]['count']});
    this.statistic$.next(this.statistic);
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

  is_a(object) {
    return object.name === this.name && object.id === this.id && object.path === this.path;
  }
}
