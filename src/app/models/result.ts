export class Result {
  id: number;
  message: string;
  status_id: string;
  created_at: number;
  constructor(data) {
    this.id = data['id'];
    this.message = data['message'];
    this.status_id = data['status_id'];
    this.created_at = data['created_at'];
  }
}
