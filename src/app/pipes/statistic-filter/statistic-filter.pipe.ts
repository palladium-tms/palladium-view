import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statisticFilter',
  pure: false
})
export class StatisticFilterPipe implements PipeTransform {

  transform(value: any[], args?: any[]): any {
    if (args.length !== 0) {
      return  value.filter(
        item => {return(item.statistic.existed_statuses.filter(current_status => args.indexOf(+current_status) > -1).length > 0); }
      );
    } else {
      return value;
    }
  }
}
