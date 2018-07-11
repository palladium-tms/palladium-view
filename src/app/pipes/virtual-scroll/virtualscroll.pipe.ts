import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'virtualscroll',
  pure: false
})
export class VirtualscrollPipe implements PipeTransform {

  transform(value: any, start: number, object_max: number): any {
    return value.slice(Math.max(0, start - 10), start + object_max);
  }
}
