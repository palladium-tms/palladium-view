export class Status {
  id: number;
  name: string;
  color: string;
  active = false;
  constructor(status_data) {
    if (status_data === null) {
      this.id = 0;
      this.name = '';
      this.color = '';
    } else {
      this.id = status_data['id'];
      this.name = status_data['name'];
      this.color = status_data['color'];
    }
  }
}
