export class Plan {
  id: number;
  name: string;
  product_id: string;
  created_at: number;
  updated_at: number;
  statistic: any;
  all_statistic: any = {'all': 0, 'lost': 0, 'attitude': 0};
  constructor (plan) {
      this.id = plan['id'];
      this.name = plan['name'];
      this.product_id = plan['product_id'];
      this.created_at = plan['created_at'].split(' +')[0];
      this.updated_at = plan['updated_at'].split(' +')[0];
      if (plan['statistic']) {
        this.statistic = plan['statistic'];
        this.get_statistic();
    }
  }
  get_statistic() {
    this.all_statistic = {'all': 0, 'lost': 0, 'attitude': 0};
    for (const one_status_data of this.statistic) {
      this.all_statistic['all'] += one_status_data['count'];
      if (one_status_data['status'] === 0) {
        this.all_statistic['lost'] = one_status_data['count'];
      }
    }
    this.sort_statistic();
    if (this.all_statistic['all'] !== 0) {
      this.all_statistic['attitude'] = (1 - this.all_statistic['lost'] / this.all_statistic['all']);
    }
  }
  sort_statistic() {
    this.statistic.sort(function (s1, s2) {
      return(s1['status'] < s2['status']);
    });
  }
}
