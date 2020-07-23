import {ReplaySubject, BehaviorSubject} from "rxjs";
import {Statistic} from './statistic';
import { Suite } from './suite';
import { Run } from './run';

export class Plan {
  id: number;
  name: string;
  product_id: string;
  isArchived: boolean;
  created_at: number;
  updated_at: number;
  caseCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  suites$: ReplaySubject<Suite[]>
  runs$: ReplaySubject<Run[]>
  statistic$: ReplaySubject<Statistic>;
  constructor (plan) {
      this.id = plan['id'];
      this.name = plan['name'];
      this.product_id = plan['product_id'];
      this.isArchived = plan['is_archived'];
      this.created_at = plan['created_at'].split(' +')[0];
      this.updated_at = plan['updated_at'].split(' +')[0];
      this.statistic$ = new ReplaySubject(1);
      this.suites$ = new ReplaySubject(1);
      this.runs$ = new ReplaySubject(1);
      this.caseCount$.next(plan['case_count'])
  }
}
