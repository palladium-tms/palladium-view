import { Pipe, PipeTransform } from '@angular/core';
import { Suite } from '../../models/suite';
import { Run } from '../../models/run';
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';

@Pipe({
  name: 'statisticFilter',
  pure: false
})
export class StatisticFilterPipe implements PipeTransform {

  transform(value, data: [number[], {}, boolean]): Observable<Array<Run | Suite>> {
    // not use 0 status because it is untested, and it will filtered in next pipe
    if (data[0].length === 0 || data[1] === {}) {
      return of(value);
    }
    const filters = data[0].filter(filter => filter !== 0);
    if (data[0].includes(0)) {
      return this.filtered_with_untested_value(value, data);
    } else {
      return this.filtered_value(value, filters);
    }
  }

  filtered_with_untested_value(value, data) {
    const filters = data[0];
    const countes = data[1];
    const planisArchived = data[2];
    return of(value).pipe(map(elements => {
      const newElementPack = [];
      if (planisArchived) {
        console.log('aaa')
        elements.forEach(element => {
          if (element.statistic.data[0] > 0) {
            newElementPack.push(element);
          }
        });
      } else {
        elements.forEach(element => {
          if (this.is_suite(element) ||
            this.is_not_full_complete(element, countes[element.name]) ||
            this.contain_filtered_status(element, filters)) {
            newElementPack.push(element);
          }
        });
      }
      return newElementPack;
    }));
  }

  is_suite(element: Run | Suite): boolean {
    return element.path === 'suite';
  }

  is_not_full_complete(element, count) {
    return count.value !== element.statistic.all;
  }

  contain_filtered_status(element, filters) {
    return element.statistic?.existedStatuses.filter(currentStatus => filters.indexOf(+currentStatus) > -1).length > 0;
  }

  filtered_value(value, filters) {
    const newValue = value.filter(element => (this.contain_filtered_status(element, filters)));
    return of(newValue);
  }
}
