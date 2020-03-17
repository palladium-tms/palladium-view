import { Pipe, PipeTransform } from '@angular/core';
import {Run} from "../models/run";
import {Suite} from "../models/suite";
import {ResultSet} from "../models/result_set";
import {Case} from "../models/case";

@Pipe({
  name: 'uniqueNameObjectFilter'
})

export class UniqueNameObjectFilterPipe implements PipeTransform {
  transform(objectForFilling: Array<Suite | Run | Case | ResultSet>, objectForAdding: Array<Suite | Run | Case | ResultSet>): unknown {
    if (objectForAdding === [] || objectForAdding == null) {
      return objectForFilling;
    }
    const objNames = objectForFilling.map(obj => obj.name);
    const objForAdding = objectForAdding.filter(_obj => !objNames.includes(_obj.name));
    return objectForFilling.concat(objForAdding);
  }
}
