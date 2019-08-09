import {Statistic} from './statistic';

export class Plan {
  id: number;
  name: string;
  product_id: string;
  created_at: number;
  updated_at: number;
  statistic: Statistic;
  constructor (plan) {
      this.id = plan['id'];
      this.name = plan['name'];
      this.product_id = plan['product_id'];
      this.created_at = plan['created_at'].split(' +')[0];
      this.updated_at = plan['updated_at'].split(' +')[0];
      if (plan['statistic']) {
        this.statistic = new Statistic(this.get_statistic_new(plan['statistic']));
    }
  }

  get_statistic_new(statistic) {
    const newStatistic = {};
    statistic.forEach((current) => {
      newStatistic[current.status] = current.count;
    });
    return newStatistic;
  }
  // sort_statistic() {
  //   this.statistic.sort((s1, s2) => (s1['status'] < s2['status']));
  // }
}
