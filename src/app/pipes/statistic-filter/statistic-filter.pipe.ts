import {Pipe, PipeTransform} from '@angular/core';
import {Suite} from '../../models/suite';
import {Run} from '../../models/run';

@Pipe({
  name: 'statisticFilter',
  pure: false
})
export class StatisticFilterPipe implements PipeTransform {

  transform(value: Array<Run | Suite>, data: [number[], {}]): Array<Run | Suite> {
    if (data[0].length === 0 || data[1] === {}) {
      return value;
    }
    if (data[0].indexOf(0) > -1) {
      return value.filter(
        item => (item.statistic.existedStatuses.filter(currentStatus => data[0].indexOf(+currentStatus) > -1).length > 0 ||
          (this.attitude_not_zero(data[1][item.name]))
        )
      );
    } else {
      return value.filter(
        item => (item.statistic.existedStatuses.filter(currentStatus => data[0].indexOf(+currentStatus) > -1).length > 0));
    }
  }

  attitude_not_zero(element) {
    if (element) {
      return element.attitude !== 0;
    }
    return false;
  }
}
