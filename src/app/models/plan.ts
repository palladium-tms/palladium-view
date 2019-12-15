export class Plan {
  id: number;
  name: string;
  product_id: string;
  isArchived: string;
  created_at: number;
  updated_at: number;
  statistic$;
  constructor (plan) {
      this.id = plan['id'];
      this.name = plan['name'];
      this.product_id = plan['product_id'];
      this.isArchived = plan['is_archived'];
      this.created_at = plan['created_at'].split(' +')[0];
      this.updated_at = plan['updated_at'].split(' +')[0];
  }
}
