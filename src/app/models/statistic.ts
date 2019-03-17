export class Statistic {
  all = 0;
  lost = 0;
  attitude = 0;
  extended = {}; // looks like {status_id: count, status_id: count, 1: 2, 0: 4...}
  existed_statuses = [];

  constructor(data) {
    this.extended = data;
    if (data === null) {
      this.extended = {};
    } else {
      this.existed_statuses = Object.keys(this.extended);
      this.existed_statuses.forEach(status_id => {
        this.all += this.extended[status_id];
        if (status_id === 0) {
          this.lost = this.extended[status_id];
        }
      });
      this.existed_statuses = Object.keys(this.extended);
      this.attitude = (1 - this.lost / this.all);
    }
  }
  add_status(id, count) {
    this.all = 0;
    this.lost = 0;
    this.attitude = 0;
    this.extended[id] = count;
    this.existed_statuses = Object.keys(this.extended);
    this.existed_statuses.forEach(status_id => {
      this.all += this.extended[status_id];
      if (status_id === 0) {
        this.lost = this.extended[status_id];
      }
    });
    this.existed_statuses = Object.keys(this.extended);
    this.attitude = (1 - this.lost / this.all);
  }

  has_statuses(status_array) {
    let status_exist = false;
    if (status_array.length === 0) {
      return true;
    }
    this.existed_statuses.forEach(status => {
      if (status_array.indexOf(+status) > -1) {
        status_exist = true;
      }
    });
    return status_exist;
  }
}
