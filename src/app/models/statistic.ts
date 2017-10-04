export class Statistic {
  all = 0;
  lost = 0;
  attitude = 0;
  extended = {}; // looks like {status_id: count, status_id: count, 1: 2, 0: 4...}
  existed_statuses = [];
  status = 0;

  constructor(data) {
    console.log(data);
    if (data === null) {
    } else if (data[0].constructor.name === ('ResultSet' || 'Case')) {
      data.forEach(result_set => {
        if (result_set['status'] in this.extended) {
          this.extended[result_set['status']] += 1;
        } else {
          this.extended[result_set['status']] = 1;
        }
      });
      this.existed_statuses = Object.keys(this.extended);
    }
    else {
      // this.all_statistic = {'all': 0, 'lost': 0, 'attitude': 0};
      for (const one_status_data of data) {
        this.all += one_status_data['count'];
        if (one_status_data.status === 0) {
          this.lost = one_status_data['count'];
        }
      }
      this.attitude = (1 - this.lost / this.all);
    }
  }
}
