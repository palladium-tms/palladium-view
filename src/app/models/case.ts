export class Case {
  id: number;
  name: string;
  status: string;
  suite_id: string;
  created_at: number;
  updated_at: number;
  constructor (current_case) {
    this.id = current_case['id'];
    this.name = current_case['name'];
    this.suite_id = current_case['suite_id'];
    this.created_at = current_case['created_at'];
    this.updated_at = current_case['updated_at'];
  }
}
