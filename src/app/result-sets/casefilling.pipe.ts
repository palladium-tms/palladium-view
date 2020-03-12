import { Pipe, PipeTransform } from '@angular/core';
import {Case} from '../models/case';
import {ResultSet} from '../models/result_set';

@Pipe({
  name: 'casefilling',
})
export class CasefillingPipe implements PipeTransform {

  transform(resultSets: Array<Case | ResultSet>, cases: Case[]): Array<Case | ResultSet> {
    if (cases === []) {
      return resultSets;
    }
    const resultSetsNames = resultSets.map(resultSet => resultSet.name);
    const casesForAdd = cases.filter(_case => !resultSetsNames.includes(_case.name));
    return resultSets.concat(casesForAdd);
  }

}
