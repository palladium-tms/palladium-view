export class Suite {
  id: number;
  name: string;
  product_id: number;
  created_at: string;
  updated_at: string;
  statistic = [{'suite_id': 0, 'status': 0, 'count': 0}];
  all_statistic: any = {'all': 0, 'lost': 0, 'attitude': 0};

  constructor (suite) {
    if (suite == null) {
      suite = this.create_default_suite();
    } else if (suite.constructor.name === 'Run') {
      suite = this.create_suite_by_run(suite);
    }
    this.id = suite['id'];
    this.name = suite['name'];
    this.product_id = suite['product_id'];
    this.created_at = suite['created_at'];
    this.updated_at = suite['updated_at'];
    this.statistic = suite['statistic'];
    this.all_statistic = this.get_all_all_statistic();
  }
  create_default_suite() {
    return {'id': 'id_loading', 'name': 'name_loading',
      'product_id': 'product_id_loading',
      'created_at': 'created_at_loading', 'updated_at': 'updated_at_loading',
      'statistic': [{'suite_id': 0, 'status': 0, 'count': 0}]};
  }
  create_suite_by_run(suite) {
    return {'id': suite['id'], 'name': suite['name'],
      'product_id': 0,
      'created_at': suite['created_at'], 'updated_at': suite['updated_at'],
      'statistic': [{'suite_id': 0, 'status': 0, 'count': 0}]};
  }
  get_all_all_statistic() {
    return {'all': this.statistic[0]['count'], 'lost': 0, 'attitude': 0};
  }
}
