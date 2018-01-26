export class Status {
  id: number;
  name: string;
  color: string;
  block: boolean;
  active = false;
  constructor(status_data) {
    if (status_data === null) {
      this.id = 0;
      this.name = '';
      this.block = false;
      this.color = '';
    } else {
      this.id = status_data['id'];
      this.name = status_data['name'];
      this.block = status_data['block'];
      this.color = status_data['color'];
    }
  }
}
