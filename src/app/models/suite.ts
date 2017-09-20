export class Suite {
  id: number;
  name: string;
  product_id: number;
  created_at: string;
  updated_at: string;

  constructor (id: number, name: string, product_id: number, created_at: string, updated_at: string) {
    this.id = id;
    this.name = name;
    this.product_id = product_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
