export class Product {
  id: number;
  name: string;
  created_at: number;
  updated_at: number;
  constructor(product) {
    if (product === null) {
      this.id = 0;
      this.name = 'product name loading';
      this.created_at = 0;
      this.updated_at = 0;
    } else {
      this.id = product['id'];
      this.name = product['name'];
      this.created_at = product['created_at'];
      this.updated_at = product['updated_at'];
    }
  }
}
