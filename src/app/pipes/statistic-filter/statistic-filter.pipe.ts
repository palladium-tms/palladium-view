import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statisticFilter',
  pure: false
})
export class StatisticFilterPipe implements PipeTransform {

  transform(value: any[], args?: any[]): any {
    if (args[0].length !== 0) {
      if (args[0].indexOf(0) > -1) {
        return  value.filter(
          item =>(item.statistic.existedStatuses.filter(currentStatus => args[0].indexOf(+currentStatus) > -1).length > 0 ||
            args[1][item.name] !== 0
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
