import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'statusFilter',
  pure: false
})
@Injectable()
export class StatusFilterPipe implements PipeTransform {
  transform(value: any[], args?: any[]): any {
    if (args.length !== 0) {
      return value.filter(item => args.indexOf(item['status']) > -1);
    } else {
      return value;
    }
  }
}
