import {Suite} from "./suite";
import {BehaviorSubject, ReplaySubject} from "rxjs";

export class Product {
  id: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  caseCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(product) {
      this.id = product['id'];
      this.name = product['name'];
      this.createdAt = product['created_at'].split(' +')[0];
      this.updatedAt = product['updated_at'].split(' +')[0];
  }
}
