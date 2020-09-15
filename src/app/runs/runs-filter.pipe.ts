import { Pipe, PipeTransform } from '@angular/core';
import {Suite} from '../models/suite';
import {Run} from '../models/run';

@Pipe({
  name: 'runsFilter'
})
export class RunsFilterPipe implements PipeTransform {

  transform(suites: Suite[], ...args: [Run[]]): Suite[] {
    const runsNames = args[0].map(run => run.name);
    return suites.filter(suite => {
      return !runsNames.includes(suite.name);
    });
  }

}
