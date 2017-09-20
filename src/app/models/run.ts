export class Run {
  id: number;
  name: string;
  plan_id: number;
  created_at: number;
  updated_at: number;
  constructor (id: number, name, plan_id, created_at, updated_at) {
    this.id = id;
    this.name = name;
    this.plan_id = plan_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
