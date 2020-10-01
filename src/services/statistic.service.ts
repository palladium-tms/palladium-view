import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {Statistic} from '../app/models/statistic';

@Injectable()
export class StatisticService {
  private subject = new Subject<Statistic>();
  planSubject = new Subject<Statistic>();


  update_run_statistic(statistic: Statistic) {
    this.subject.next(statistic);
  }

  statistic_has_changed() {
    return this.subject.asObservable();
  }

  update_plan_statistic(statistic: Statistic) {
    this.planSubject.next(statistic);
  }
}
