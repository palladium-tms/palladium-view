export class Plan {
  id: number;
  name: string;
  product_id: string;
  created_at: number;
  updated_at: number;
  statistic: any;
  all_statistic: any = {'all': 0, 'lost': 0, 'attitude': 0};
  constructor (plan) {
    if (plan === null) {
      this.create_default_plan();
    } else if (plan.constructor.name === 'Suite') {
    } else {
      this.id = plan['id'];
      this.name = plan['name'];
      this.product_id = plan['product_id'];
      this.created_at = plan['created_at'];
      this.updated_at = plan['updated_at'];
      this.statistic = plan['statistic'];
      this.get_statistic();
    }
  }
  create_default_plan() {
    this.id = 0;
    this.name = 'name_loading';
    this.product_id = 'product_id_loading';
    this.created_at = 0;
    this.updated_at = 0;
    this.statistic = [];
  }
  get_statistic() {
    this.all_statistic = {'all': 0, 'lost': 0, 'attitude': 0};
    for (const one_status_data of this.statistic) {
      console.log('++++++++++++++++++++');
      console.log(this.name);
      console.log(one_status_data);
      // console.log(this.all_statistic['lost']);
      console.log('++++++++++++++++++++');


      this.all_statistic['all'] += one_status_data['count'];
      if (one_status_data['status'] === 0) {
        this.all_statistic['lost'] = one_status_data['count'];
      }
    }
    // console.log('++++++++++++++++++++');
    // console.log(this.name);
    // console.log(this.all_statistic['all']);
    // console.log(this.all_statistic['lost']);
    // console.log('++++++++++++++++++++');

    if (this.all_statistic['all'] !== 0) {
      this.all_statistic['attitude'] = (1 - this.all_statistic['lost'] / this.all_statistic['all']);
    }
  }
}
