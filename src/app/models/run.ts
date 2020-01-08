import {Point, Statistic} from './statistic';
import {ReplaySubject} from 'rxjs';

export class Run {
  id: number;
  name: string;
  plan_id: number;
  created_at: number;
  updated_at: number;
  statistic$: ReplaySubject<Statistic> = new ReplaySubject(1);
  statistic: Statistic;
  path = 'run';
  constructor (run) {
    if (run === null) {
      this.create_default_run();
    } else {
      this.id = run['id'];
      this.name = run['name'];
      this.plan_id = run['plan_id'];
      this.created_at = run['created_at'].split(' +')[0];
      this.updated_at = run['updated_at'].split(' +')[0];
      this.statistic = this.get_statistic(run);
      // FIXME: delete cached data
      this.statistic$.next(this.statistic);
    }
  }

  create_default_run() {
    this.id = 0;
    this.name = 'name_loading';
    this.plan_id = 0;
    this.created_at = 0;
    this.updated_at = 0;
  }

  get_statistic(data) {
    const statData = {};
    data.statistic.forEach(object => {
      statData[object['status']] = object['count'];
    });
    return new Statistic(statData);
  }

  update_point_statuses(points: Point[]): void {
    const activePoints = [];
    points.forEach(point => {
      if (point.active) {
        activePoints.push(point.status);
      }
    });
    this.statistic.points.forEach(point => {
      point.active = activePoints.includes(point.status);
    });
    this.statistic$.next(this.statistic);
  }
}
