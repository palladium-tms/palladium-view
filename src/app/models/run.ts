import {Point, Statistic} from './statistic';
import {ReplaySubject} from 'rxjs';
import { ResultSet } from './result_set';

export class Run {
  id: number;
  name: string;
  plan_id: number;
  created_at: number;
  updated_at: number;
  resultSets$: ReplaySubject<ResultSet[]>
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
      this.resultSets$ = new ReplaySubject(1);
      this.statistic$.next(this.statistic);
    }
    this.resultSets$.subscribe(resultSets => {
      let statisticData = {};
      resultSets.forEach(resultSet => {
        if (!statisticData[resultSet.status]) {
          statisticData[resultSet.status] = 0;
        }
        statisticData[resultSet.status] += 1;
      });
      this.update_point_statuses(statisticData);
    })
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

  update_point_statuses(data): void {
    const statistic = new Statistic(data);
    const activePoints = [];
    this.statistic.points.forEach(point => {
      if (point.active) {
        activePoints.push(point.status);
      }
    });
    statistic.points.forEach(point => {
      point.active = activePoints.includes(point.status);
    });
    // cached needs for easy plan statustuc update. Delete it after research
    this.statistic = statistic;
    this.statistic$.next(this.statistic);
  }

  is_a(object) {
    return object.name === this.name && object.id === this.id && object.path === this.path;
  }
}
