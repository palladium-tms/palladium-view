import { Pipe, PipeTransform } from '@angular/core';
import {Suite} from "../../models/suite";
import {Run} from "../../models/run";

@Pipe({
  name: 'statisticFilter',
  pure: false
})
export class StatisticFilterPipe implements PipeTransform {

  transform(value: Array<Run|Suite>, args?: any[]): Array<Run|Suite> {
    if (args[0].length !== 0) {
      if (args[0].indexOf(0) > -1) {
        return  value.filter(
          item =>(item.statistic.existedStatuses.filter(currentStatus => args[0].indexOf(+currentStatus) > -1).length > 0 ||
            (args[1][item.name] && args[1][item.name].count > 0)
          )
        );
      } else {
        return  value.filter(
          item =>(item.statistic.existedStatuses.filter(currentStatus => args[0].indexOf(+currentStatus) > -1).length > 0));
      }
    } else {
      return value;
    }
  }
}
