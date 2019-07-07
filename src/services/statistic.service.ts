import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import {Statistic} from '../app/models/statistic';

@Injectable()
export class StatisticService {
  private subject = new Subject<any>();

  update_parant_statistic(Object) {
    this.subject.next(Object);
  }

  statistic_has_changed() {
    return this.subject.asObservable();
  }
  // calculate statistic
  runs_and_suites_statistic(runs_and_suites) {
    const all_statistic = {};
    runs_and_suites.forEach(object => {
      object.statistic.existed_statuses.forEach( status_id => {
        if (all_statistic[status_id]) {
          all_statistic[status_id] += object.statistic.extended[status_id];
        } else {
          all_statistic[status_id] = object.statistic.extended[status_id];
        }
      });
    });
    return new Statistic(all_statistic);
  }
}
