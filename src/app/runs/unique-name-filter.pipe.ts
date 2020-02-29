import { Pipe, PipeTransform } from '@angular/core';
import {Run} from "../models/run";
import {Suite} from "../models/suite";

@Pipe({
  name: 'uniqueNameFilter'
})

export class UniqueNameFilterPipe implements PipeTransform {
  transform(objectForFilter: Array<Suite | Run>, objectForNameGetting: Array<Suite | Run>): Array<Suite | Run> {
    const runsName = objectForNameGetting.map(run => run.name);
    return objectForFilter.filter(suite => !runsName.includes(suite.name));
  }
}
