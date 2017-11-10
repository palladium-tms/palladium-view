import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'SortByUpdatedAt'
})
export class SortByUpdatedAtPipe implements PipeTransform {

  // asc desc
  transform(value: any[], args?: any): any {
    if (args === 'asc') {
      value.sort(function(a, b) { return new Date(a['run']['result_set']['result_set_updated_at']).getTime() -
        new Date(b['run']['result_set']['result_set_updated_at']).getTime(); });
    } else if (args === 'desc') {
      value.sort(function(a, b) { return new Date(b['run']['result_set']['result_set_updated_at']).getTime() -
        new Date(a['run']['result_set']['result_set_updated_at']).getTime(); });
    }
    return value;
  }
}
