import {Pipe, PipeTransform} from '@angular/core';
import {Suite} from '../../models/suite';
import {Run} from '../../models/run';

@Pipe({
  name: 'statisticFilter',
  pure: false
})
export class StatisticFilterPipe implements PipeTransform {

  transform(value: Array<Run | Suite>, data: [number[], {}]): Array<Run | Suite> {
    if (data[0].length === 0) {
      return value;
    }

    if (data[0].indexOf(0) > -1) {
      return value.filter(
        item => (item.statistic.existedStatuses.filter(currentStatus => data[0].indexOf(+currentStatus) > -1).length > 0 ||
          (data[1][item.name].attitude !== 0)
        )
      );
    } else {
      return value.filter(
        item => (item.statistic.existedStatuses.filter(currentStatus => data[0].indexOf(+currentStatus) > -1).length > 0));
    }
  }
}
