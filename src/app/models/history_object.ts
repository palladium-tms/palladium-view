import {ResultSet} from './result_set';
import {Plan} from './plan';
export class History extends ResultSet {
  plan: Plan;
  object_status: String = 'closed';

  constructor(object) {
    super(object);
    this.plan = new Plan(object.plan);
  }
}
