import {Suite} from "./suite";
import {ReplaySubject} from "rxjs";

export class Product {
  id: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  suites$: ReplaySubject<Suite[]> = new ReplaySubject(1);
  caseCount$: ReplaySubject<number> = new ReplaySubject(1);

  constructor(product) {
      this.id = product['id'];
      this.name = product['name'];
      this.createdAt = product['created_at'].split(' +')[0];
      this.updatedAt = product['updated_at'].split(' +')[0];
    this.suites$.subscribe(suites => {
      const caseCount = this.case_count(suites);
      this.caseCount$.next(caseCount);
    });
  }

  private case_count(suites) {
    let casesCount = 0;
    suites.forEach(suite => {
        casesCount += suite.statistic.all;
      });
    return casesCount;
  }
}
