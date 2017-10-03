export class Statistic {
  all = 0;
  lost = 0;
  attitude = 0;
  extended = {}; // looks like {status_id: count, status_id: count, 1: 2, 0: 4...}
  existed_statuses = [];

  constructor (data) {
    if (data === null) {
    } else {
      data.forEach(result_set => {
      if (result_set['status'] in this.extended) {
        this.extended[result_set['status']] += 1;
      } else {
        this.extended[result_set['status']] = 1;
        }
      });
      this.existed_statuses = Object.keys(this.extended);
    }
  }
}
