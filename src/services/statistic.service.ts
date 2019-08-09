import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import {Statistic} from '../app/models/statistic';

@Injectable()
export class StatisticService {
  private subject = new Subject<Statistic>();
  planSubject = new Subject<Statistic>();


  update_parant_statistic(statistic) {
    this.subject.next(statistic);
  }

  statistic_has_changed() {
    return this.subject.asObservable();
  }

  plan_statistic_update(statistic) {
    this.planSubject.next(statistic);
  }
  // calculate statistic
  runs_and_suites_statistic(objects):Statistic {
    const allStatistic = {};
    objects.forEach(object => {
      object.statistic.existed_statuses.forEach( statusId => {
        if (allStatistic[statusId]) {
          allStatistic[statusId] += object.statistic.extended[statusId];
        } else {
          allStatistic[statusId] = object.statistic.extended[statusId];
        }
      });
    });
    return new Statistic(allStatistic);
  }
}
