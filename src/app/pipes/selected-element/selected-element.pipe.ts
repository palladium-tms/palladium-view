import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'selectedElement'
})
export class SelectedElementPipe implements PipeTransform {

  transform(value: any, args: any): any {
    if (!value) {return null; }
    if (!args) {return value; }
    return value.filter(item => args[item.id]);
  }
}
