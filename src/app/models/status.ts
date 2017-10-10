export class Status {
  name: string;
  color: string;
  constructor(status_data) {
    this.name = status_data['name'];
    this.color = status_data['color'];
  }
}
