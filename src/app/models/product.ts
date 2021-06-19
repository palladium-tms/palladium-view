import {BehaviorSubject} from "rxjs";

interface PlanTemplate {
  id: number,
  name: string,
  updated_at: Date,
}

export class Product {
  id: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  last_plan: PlanTemplate;
  caseCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(product) {
      this.id = product['id'];
      this.name = product['name'];
      this.createdAt = product['created_at'].split(' +')[0];
      this.updatedAt = product['updated_at'].split(' +')[0];
      if (product['last_plan']) {
        this.last_plan = {
          name: product['last_plan']['name'],
          id: product['last_plan']['id'],
          updated_at: new Date(product['last_plan']['updated_at'])
        };
      }

  }
}
