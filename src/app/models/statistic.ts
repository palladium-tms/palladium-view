export interface StatisticInterface {
  [key: number]: number;
}

export class Statistic {
  all: number;
  points: Point[] = [];
  lost = 0;
  attitude = 1;
  extended = {}; // looks like {status_id: count, status_id: count, 1: 2, 0: 4...}
  existedStatuses = [];
  data;

  constructor(data: StatisticInterface) {
    this.data = data;
    if (Object.keys(data).length === 0) {
      return;
    }
    this.all = +Object.values(data).reduce((a: number, b: number) => a + b);
    this.existedStatuses = Object.keys(this.data);
    Object.entries(data).forEach(
      ([statusId, count]) => this.points.push(new Point(statusId, count, this.all))
    );
  }
}

export class Point {
  status: number;
  attitude: number;
  count: number;
  active: boolean;

  constructor(status, count, all) {
    this.status = +status;
    this.count = count;
    this.attitude = count / all;
    this.active = false;
  }
}
