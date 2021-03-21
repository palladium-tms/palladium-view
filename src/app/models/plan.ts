import { ReplaySubject, BehaviorSubject, merge } from "rxjs";
import { Statistic } from './statistic';
import { Suite } from './suite';
import { Run } from './run';
import { map, switchMap, take } from 'rxjs/operators';

export class Plan {
  id: number;
  name: string;
  product_id: string;
  isArchived: boolean;
  apiCreated: boolean;
  created_at: number;
  updated_at: number;
  caseCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  suites$: ReplaySubject<Suite[]>
  runs$: ReplaySubject<Run[]>
  statistic$: ReplaySubject<Statistic>;
  constructor(plan) {
    this.id = plan['id'];
    this.name = plan['name'];
    this.product_id = plan['product_id'];
    this.isArchived = plan['is_archived'];
    this.apiCreated = plan['api_created'];
    this.created_at = plan['created_at'].split(' +')[0];
    this.updated_at = plan['updated_at'].split(' +')[0];
    this.statistic$ = new ReplaySubject(1);
    this.suites$ = new ReplaySubject(1);
    this.runs$ = new ReplaySubject(1);
    this.caseCount$.next(plan['case_count'])
    this.runs$.pipe(switchMap(runs => {
      let all_statistics = [];
      runs.forEach(run => {
        all_statistics.push(run.statistic$);
      })
      return merge(...all_statistics).pipe(map(() => {
        this.update_statistic(runs)
      }))
    })).subscribe()
    this.suites$.pipe(map(suites => {
      let caseCount = 0;
      suites.forEach(suite => {
        caseCount += suite.caseCount;
      })
      this.caseCount$.next(caseCount);
    })).subscribe()
  }

  recalculate_case_count(): void {
    this.suites$.pipe(take(1), map(suites => {
      let caseCount = 0;
      suites.forEach(suite => {
        caseCount += suite.caseCount;
      })
      this.caseCount$.next(caseCount);
    })).subscribe()
  }

  update_statistic(runs: Run[]) {
    const data = {};
    runs.forEach((run: Run) => {
      run.statistic.points.forEach(point => {
        if (!data[point.status]) {
          data[point.status] = 0;
        }
        data[point.status] += point.count;
      });
    })
    this.statistic$.next(new Statistic(data))
  }
}
