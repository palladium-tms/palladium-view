export interface StatisticInterface {
  [key: number]: number;
}

export class Statistic {
  all: number;
  points: Point[] = [];
  attitude = 1;
  existedStatuses = [];
  data = {};

  constructor(data: StatisticInterface) {
    this.data = data;
    if (Object.keys(data).length === 0) {
      return;
    }
    this.calculate();
  }

  calculate() {
    const _points = [];
    this.all = +Object.values(this.data).reduce((a: number, b: number) => a + b);
    this.existedStatuses = Object.keys(this.data);
    Object.entries(this.data).forEach(
      ([statusId, count]) => _points.push(new Point(statusId, count, this.all))
    );
    this.points = _points;
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
