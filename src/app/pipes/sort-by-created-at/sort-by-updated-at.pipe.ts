import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'SortByUpdatedAt'
})
export class SortByUpdatedAtPipe implements PipeTransform {

  // asc desc
  transform(value: any[], args?: any): any {
    if (args === 'asc') {
      value.sort(function(a, b) { return new Date(a['updated_at'].split(' +')[0]).getTime() -
        new Date(b['updated_at'].split(' +')[0]).getTime()});
    } else if (args === 'desc') {
      value.sort(function(a, b) { return new Date(b['updated_at'].split(' +')[0]).getTime() -
        new Date(a['updated_at'].split(' +')[0]).getTime()});
    }
    return value;
  }
}
