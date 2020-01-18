import { Pipe, PipeTransform } from '@angular/core';
import {Result} from "../../models/result";

@Pipe({
  name: 'sortByCreatedAt',
  pure: false
})
export class SortByCreatedAtPipe implements PipeTransform {

  transform(value: Result[], args?: ('asc' | 'desc')): Result[] {
    if (!value) {
      return [];
    }
    if (args === 'asc') {
      value.sort((a, b) => a.id - b.id);
    } else if (args === 'desc') {
      value.sort((a, b) => b.id - a.id);
    }
    return value;
  }

}
