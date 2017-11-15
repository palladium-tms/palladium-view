import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'SortByUpdatedAt'
})
export class SortByUpdatedAtPipe implements PipeTransform {

  // asc desc
  transform(value: any[], args?: any): any {
    if (args === 'asc') {
      value.sort(function(a, b) { return new Date(a['updated_at']).getTime() -
        new Date(b['updated_at']).getTime(); });
    } else if (args === 'desc') {
      value.sort(function(a, b) { return new Date(b['updated_at']).getTime() -
        new Date(a['updated_at']).getTime(); });
    }
    return value;
  }
}
