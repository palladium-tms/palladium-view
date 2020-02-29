import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'runsFilter'
})
export class RunsFilterPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return value;
  }

}
