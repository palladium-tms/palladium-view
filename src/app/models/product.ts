export class Product {
  id: number;
  name: string;
  created_at: number;
  updated_at: number;
  constructor(product) {
      this.id = product['id'];
      this.name = product['name'];
      this.created_at = product['created_at'].split(' +')[0];
      this.updated_at = product['updated_at'].split(' +')[0];
  }
}
