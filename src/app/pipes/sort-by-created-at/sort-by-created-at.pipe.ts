import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByCreatedAt'
})
export class SortByCreatedAtPipe implements PipeTransform {

  // asc desc
  transform(value: any[], args?: any): any {
    console.log('pipe')
    if (!value) {
      return [];
    }
    if (args === 'asc') {
      value.sort(function(a, b) { return a.id - b.id; });
    } else if (args === 'desc') {
      value.sort(function(a, b) { return b.id - a.id; });
    }
    return value;
  }

}
