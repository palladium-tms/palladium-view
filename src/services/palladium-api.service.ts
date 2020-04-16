import {Injectable} from '@angular/core';
import {HttpService} from './http-request.service';
import {AuthenticationService} from './authentication.service';
import {Router} from '@angular/router';
import {Suite} from '../app/models/suite';
import {Run} from '../app/models/run';
import {Product} from '../app/models/product';
import {Plan} from '../app/models/plan';
import {Case} from '../app/models/case';
import {ResultSet} from '../app/models/result_set';
import {Result} from '../app/models/result';
import {History} from '../app/models/history_object';
import {Status} from '../app/models/status';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {Statistic} from '../app/models/statistic';
import 'rxjs/Rx';
import {NGXLogger} from 'ngx-logger';
import {Invite} from "../app/models/invite";

export interface StructuredStatuses {
  [key: number]: Status;
}

// key is a product id
export interface StructuredPlans {
  [key: number]: Plan[];
}

// key is a plan id
export interface StructuredRuns {
  [key: number]: Run[];
}

// key is a product id
export interface StructuredSuites {
  [key: number]: Suite[];
}

// key is a suite id
export interface StructuredCases {
  [key: number]: Case[];
}

export interface StructuredResultSets {
  [key: number]: ResultSet[];
}

export interface StructuredResults {
  [key: number]: Result[];
}

// {productId: {run_name: [resultSet,  resultSet, resultSet]}}
export interface StructuredHistoryPack {
  [key: number]: { [key: string]: ResultSet[] };
}

export interface UserSettings {
  timeZone: ReplaySubject<string>;
}

export interface RequestToken {
  tokens: Token[];
}
export interface Token {
  id: number;
  name: string;
  token: string;
  user_id: number;
}

@Injectable()
export class PalladiumApiService {
  products$: ReplaySubject<Product[]> = new ReplaySubject(1);
  private _products: Product[] = [];

  plans$: ReplaySubject<StructuredPlans> = new ReplaySubject(1);
  private _plans: StructuredPlans = {};

  runs$: ReplaySubject<StructuredRuns> = new ReplaySubject(1);
  private _runs: StructuredRuns = {};

  resultSets$: ReplaySubject<StructuredResultSets> = new ReplaySubject(1);
  private _resultSets: StructuredResultSets = {};

  results$: ReplaySubject<StructuredResults> = new ReplaySubject(1);
  private _results: StructuredResults = {};

  historyPack$: ReplaySubject<StructuredHistoryPack> = new ReplaySubject(1);
  private _historyPack: StructuredHistoryPack = {};

  userSettings: UserSettings = {
    timeZone: new ReplaySubject(1)
  };

  statuses$: ReplaySubject<StructuredStatuses> = new ReplaySubject(1);
  private _statuses: StructuredStatuses = {};

  suites$: ReplaySubject<StructuredSuites> = new ReplaySubject(1);
  private _suites: StructuredSuites = {};

  cases$: BehaviorSubject<StructuredCases> = new BehaviorSubject({});
  private _cases: StructuredCases = {};

  invite$: ReplaySubject<Invite> = new ReplaySubject(1);

  resultSets: StructuredResultSets = {};
  statuses: StructuredStatuses = {0: new Status({name: 'Untested', color: '#ffffff5c', id: 0, 'blocked': true})};
  cases: Case[] = [];
  result_sets: ResultSet[] = [];
  // histories: ResultSet[] = [];
  // _timeZone: string;

  constructor(private router: Router, private httpService: HttpService,
              private authenticationService: AuthenticationService, private logger: NGXLogger) {
  }

  // #region Status
  get_statuses(): void {
    this.httpService.postData('/statuses', '').map(resp => {
      this._statuses = {0: new Status({name: 'Untested', color: '#efefef', id: 0, 'block': true})};
      Object.keys(resp['statuses']).forEach(key => {
        const statusNew = new Status(resp['statuses'][key]);
        this._statuses[statusNew.id] = statusNew;
      });
      this.statuses$.next(this._statuses);
    }).subscribe();
  }

  block_status(id): void {
    this.httpService.postData('/status_edit', {status_data: {id, block: true}}).subscribe(response => {
      this._statuses[id] = new Status(response['status']);
      this.statuses$.next(this._statuses);
    });
  }

  update_status(id, name, color): void {
    this.httpService.postData('/status_edit', {status_data: {id, name, color}}).subscribe(response => {
      this._statuses[id] = new Status(response['status']);
      this.statuses$.next(this._statuses);
    });
  }

  status_new(name, color): void {
    this.httpService.postData('/status_new', {status_data: {color, name}}).subscribe(response => {
      const newStatus = new Status(response['status']);
      this._statuses[newStatus.id] = newStatus;
      this.statuses$.next(this._statuses);
    });
  }

  // #endregion

  // //#region Token
  get_tokens(): Observable<Token[]> {
    return this.httpService.postData('/tokens', '').map((resp: RequestToken) => {
      return resp.tokens;
    });
  }

  create_token(name: string): Observable<Token[]> {
    return this.httpService.postData('/token_new', {token_data: {name}}).map(resp => {
      return resp['token_data'];
    });
  }

  // //#endregion
  //
  // #region Suite
  get_suites(productId: number): void {
    this.httpService.postData('/suites', {suite_data: {product_id: productId}}).map(response => {
      const suites = [];
      response['suites'].forEach(suite => {
        suites.push(new Suite(suite));
      });
      this._suites[productId] = suites;
      this.suites$.next(this._suites);
      this.case_count(productId);
    }).subscribe();
  }

  case_count(productId) {
    this.products$.first().subscribe(products => {
      const product = products.find(product => product.id === +productId);
      let count = 0;
      this._suites[productId].forEach(suite => {
        count += suite.caseCount;
      });
      product.caseCount$.next(count);
    });
  }


  edit_suite_by_run_id(run, name, planId): void {
    const params = {suite_data: {run_id: run.id, name}};
    this.httpService.postData('/suite_edit', params).map(response => {
      this.update_suite(response);
      const runNew = this._runs[planId].find(currentRun => currentRun.name === run.name);
      runNew.name = response['suite']['name'];
      runNew.updated_at = response['suite']['updated_at'];
      this.runs$.next(this._runs);
    }).subscribe();
  }

  update_suite(response) {
    const productId = response['suite']['product_id'];
    const suite = this._suites[productId][this._suites[productId].findIndex(x => x.id === response['suite'].id)];
    suite.name = response['suite']['name'];
    suite.updated_at = response['suite']['updated_at'];
    this.suites$.next(this._suites);
  }

  edit_suite(id, name): void {
    this.httpService.postData('/suite_edit', {suite_data: {name, id}}).map(response => {
      this.update_suite(response);
    }).subscribe();
  }


  delete_suite(suiteId): void {
    this.httpService.postData('/suite_delete', {suite_data: {id: suiteId}}).map(response => {
      const productId = response['suite']['product_id'];
      this._suites[productId] = this._suites[productId].filter(suite => suite.id !== response['suite']['id']);
      this.suites$.next(this._suites);
    }).subscribe();
  }

  // #endregion

  // //#region Cases
  get_cases(id): void {
    this.httpService.postData('/cases', {case_data: {suite_id: id}}).map(resp => {
      this._cases[id] = [];
      Object(resp['cases']).forEach(currentCase => {
        this._cases[id].push(new Case(currentCase));
      });
      this.cases$.next(this._cases);
    }).subscribe();
  }

  get_cases_by_run_id(runId, productId): void {
    this.httpService.postData('/cases', {
      case_data: {
        run_id: runId,
        product_id: productId
      }
    }).map(resp => {
      const _cases = [];
      Object(resp['cases']).forEach(currentCase => {
        _cases.push(new Case(currentCase));
      });
      this._cases[resp['suite']['id']] = _cases;
      this.cases$.next(this._cases);
      //
      // const suites = this._suites[resp['suite']['product_id']];
      // if (suites) {
      //   const suite = suites.find(suite => suite.id === resp['suite']['id']);
      //   suite.cases$.next(_cases);
      // }
    }).subscribe();
  }

  edit_case_by_result_set_id(resultSetId, runId, name): void {
    this.httpService.postData('/case_edit', {case_data: {result_set_id: resultSetId, name}}).map(response => {
      this._resultSets[runId][this._resultSets[runId].findIndex(x => x.id === resultSetId)].name = name;
      this.resultSets$.next(this._resultSets);
    }).subscribe();
  }

  //
  // async edit_case(case_id, name) {
  //   const resp = await this.httpService.postData('/case_edit', {case_data: {id: case_id, name: name}});
  //   return new Case(resp['case']);
  // }
  //
  delete_case(caseId, productId): void {
    this.httpService.postData('/case_delete', {case_data: {id: caseId}}).map(response => {
      const suiteId = response['case']['suite_id'];
      this._cases[suiteId] = this._cases[suiteId].filter(_case => _case.id !== caseId);
      this.cases$.next(this._cases);
      const suite = this._suites[productId].find(suite => suite.id === suiteId);
      suite.decrease_case_count();
      this.suites$.next(this._suites);
      this.case_count(productId);
    }).subscribe();
  }

  get_history(caseData: ({ id: number } | { result_set_id: number })): void {
    this.httpService.postData('/case_history', {case_data: caseData}).map(resp => {
      const productId = resp['product_id'];
      const suiteName = resp['suite_name'];
      this._historyPack[productId] = this._historyPack[productId] || {};
      this._historyPack[productId][suiteName] = this._historyPack[productId][suiteName] || [];
      resp['result_sets_history'].forEach(data => {
        this._historyPack[productId][suiteName].push(new History(data));
      });
      this.historyPack$.next(this._historyPack);
    }).subscribe();
  }

  //#endregion

  //#region Run
  get_runs(planId) {
    return this.httpService.postData('/runs', {run_data: {plan_id: planId}}).map(
      response => {
        this._runs[planId] = [];
        response['runs'].forEach(run => {
          this._runs[planId].push(new Run(run));
        });
        this.runs$.next(this._runs);
        return this._runs;
      });
  }

  get_run(runId): void {
    this.httpService.postData('/run', {run_data: {id: runId}}).map(
      response => {
        const newRun = new Run(response['run']);
        const oldRunIndex = this._runs[newRun.plan_id].findIndex(run => run.id === response['run']['id']);
        newRun.update_point_statuses(this._runs[newRun.plan_id][oldRunIndex].statistic.points);
        this._runs[newRun.plan_id][oldRunIndex] = newRun;
        this.runs$.next(this._runs);
      }).subscribe();
  }

  init_runs(planId: number): void {
    this.get_runs(planId).subscribe();
  }

  //
  // create_run(run_name, plan_id): Promise<any> {
  //   return this.httpService.postData('/run_new', {run_data: {plan_id: plan_id, name: run_name}})
  //     .then(
  //       (resp: any) => {
  //         return new Run(resp['run']);
  //       }, (errors: any) => {
  //         console.log(errors);
  //       });
  // }
  //
  delete_run(run: Run): void {
    this.httpService.postData('/run_delete', {run_data: {id: run.id}}).map(result => {
      console.log(run.plan_id);
      this._runs[run.plan_id] = this._runs[run.plan_id].filter(currentRun => currentRun.id !== run.id);
      console.log(result);
      this.runs$.next(this._runs);
    }).subscribe();
  }

  run_name_by_id(runId: number, planId: number): string {
    return this._runs[planId].find(run => run.id === runId).name;
  }

  //#endregion

  //#region Products
  get_products(): void {
    this.httpService.postData('/products', '').map(response => {
      this._products = response['products'].map(product => new Product(product));
      // Object.keys(this._suites).forEach(productId => {
      //   this._products.find(product => {
      //     return product.id === +productId;
      //   }).suites$.next(this._suites[productId]);
      // });
      this.products$.next(this._products);
    }).subscribe();
  }

  delete_product(id): void {
    this.httpService.postData('/product_delete', {product_data: {id}}).map(result => {
      this._products = this._products.filter(product => product.id !== id);
      this.products$.next(this._products);
    }).subscribe();
  }

  edit_product(id, name): void {
    this.httpService.postData('/product_edit', {product_data: {name, id}}).map(result => {
      this._products[this._products.findIndex(x => x.id === result['product'].id)] = new Product(result['product']);
      this.products$.next(this._products);
    }).subscribe();
  }

  send_product_position(productIds) {
    return this.httpService.postData('/set_product_position', {product_position: productIds}).subscribe();
  }

  //#endregion

  //#region Plans
  get_plans(params): void {
    const productId = params['plan_data']['product_id'];
    this.httpService.postData('/plans', params).map(response => {
      this.logger.debug('get_plans. params: ' + params);
      Object(response['plans']).forEach(plan => {
        const _plan = new Plan(plan);
        this._plans[productId].push(_plan);
      });
      this.plans$.next(this._plans);
      const plansId = Object(response['plans']).map(plan => plan.id);
      this.get_plans_statistic(plansId, productId);
    }).subscribe();
    this.get_suites(productId);
  }

  oldest_plan(productId): number {
    return this._plans[productId].reduce((min, p) => p.id < min ? p.id : min, this._plans[productId][0].id);
  }

  init_plans(productId: number, planId: (number | undefined)): void {
    this.logger.debug('init_plans. productId: ' + productId);
    this.logger.debug('init_plans. planId: ' + planId);
    if (!this._plans[productId]) {
      this._plans[productId] = [];
      const params = {plan_data: {product_id: productId}};
      if (planId) {
        params['plan_data']['plan_id'] = planId;
      }
      this.get_plans(params);
    }
  }

  // async get_plans_to_id(productId, planId) {
  //   const response = await this.httpService.postData('/plans', {plan_data: {product_id: productId, plan_id: planId}});
  //   const archivedPlans = response['plans'].filter(plan => plan['is_archived']);
  //   const plans = response['plans'].filter(plan => !plan['is_archived']);
  //   const statisticPromise = this.get_plans_statistic(plans.map(plan => plan.id));
  //   const tmpPlans = [];
  //
  //   archivedPlans.forEach( plan => {
  //     const _plan = new Plan(plan);
  //     _plan.statistic$ = Promise.resolve(new Statistic(this.reformatted_statistic_data(JSON.parse(plan.statistic))));
  //     tmpPlans.push(_plan);
  //   });
  //   plans.forEach(plan => {
  //     const _plan = new Plan(plan);
  //     _plan.statistic$ = statisticPromise.then(statisticAll => {
  //       return statisticAll[_plan.id] || plan.statistic;
  //     });
  //     tmpPlans.push(_plan);
  //   });
  //
  //   if (this.plans[productId]) {
  //     this.plans[productId] = this.plans[productId].concat(tmpPlans);
  //   } else {
  //     this.plans[productId] = tmpPlans;
  //   }
  //   return tmpPlans === []; // there are not more plans for loading
  // }

  get_plans_show_more(productId): void {
    const params = {plan_data: {product_id: productId, after_plan_id: this.oldest_plan(productId)}};
    this.get_plans(params);
  }

  get_plans_statistic(planIds: number[], productId: number): void {
    this.httpService.postData('/plans_statistic', {plan_data: planIds}).map(response => {
      this.logger.debug('get_plans_statistic. planIds: ' + planIds + ' productId: ' + productId);
      planIds.forEach(planId => {
        const statistic: Statistic = new Statistic(this.reformatted_statistic_data(response['statistic'][planId]));
        this.logger.debug('get_plans_statistic:');
        this.logger.debug(statistic);
        this._plans[productId].find(plan => plan.id === planId).statistic$.next(statistic);
      });
    }).subscribe();
  }

  // method for reformat statistic data from [{plan_id: 1, count:2, status:3}, {}, {}] to
  reformatted_statistic_data(data) {
    const _statistic = {};
    if (data) {
      data.forEach(i => {
        _statistic[i.status] = i.count;
      });
    }
    return _statistic;
  }

  edit_plan(id, name): void {
    this.httpService.postData('/plan_edit', {plan_data: {plan_name: name, id}})
      .map(response => {
        this.logger.debug('edit_plan. id: ', id, '; name: ', name);
        const productId = response['plan'].product_id;
        const plan = this._plans[productId][this._plans[productId].findIndex(x => x.id === response['plan'].id)];
        plan.name = response['plan']['name'];
        plan.updated_at = response['plan']['updated_at'];
        this.plans$.next(this._plans);
      }).subscribe();
  }

  async archive_plane(planId) {
    // return this.httpService.postData('/plan_archive', {plan_data: {id: planId}}).then(response => {
    //   console.log(response);
    // });
  }

  delete_plan(id): void {
    this.httpService.postData('/plan_delete', {plan_data: {id}}).map(result => {
      const productId = result['plan']['product_id'];
      this._plans[productId] = this._plans[productId].filter(plan => plan.id !== id);
      this.plans$.next(this._plans);
    }).subscribe();
  }

  //#endregion

  // //#region Result Set
  get_result_sets(runId: number): void {
    this.httpService.postData('/result_sets', {result_set_data: {run_id: runId}}).map(response => {
      this._resultSets[runId] = [];
      response['result_sets'].forEach(resultSet => {
        this._resultSets[runId].push(new ResultSet(resultSet));
      });
      this.resultSets$.next(this._resultSets);
      this.update_run_statistic(runId);
    }).subscribe();
  }

  delete_result_set(id, runId): void {
    this.httpService.postData('/result_set_delete', {result_set_data: {id}}).map(_ => {
      // this.get_run(runId);
      this._resultSets[runId] = this._resultSets[runId].filter(resultSet => resultSet.id !== id);
      this.resultSets$.next(this._resultSets);
      this.update_run_statistic(runId);
    }).subscribe();
  }

  update_run_statistic(runId) {
    const statisticData = {};
    this._resultSets[runId].forEach(resultSet => {
      if (!statisticData[resultSet.status]) {
        statisticData[resultSet.status] = 0;
      }
      statisticData[resultSet.status] += 1;
    });
    const planId = this._resultSets[runId][0]?.plan_id;
    if (planId) {
      this.runs$.first().subscribe(runs => {
        runs[planId].find(run => run.id === runId).update_point_statuses(statisticData);
        this.update_plan_statistic(planId);
      });
    }
  }

  update_plan_statistic(planId) {
    const data = {};
    this._runs[planId].forEach(run => {
      run.statistic$.first().subscribe(statistic => {
        statistic.points.forEach(point => {
          if (!data[point.status]) {
            data[point.status] = 0;
          }
          data[point.status] += point.count;
        });
      });
    });
    const statistic = new Statistic(data);
    this.plans$.first().subscribe(plans => {
      ([] as Plan[]).concat(...Object.values(plans)).find(plan => plan.id === planId).statistic$.next(statistic);
    });
  }

  //#endregion

  //#region Result
  get_results(resultSetId) {
    this.httpService.postData('/results', {result_data: {result_set_id: resultSetId}}).map(response => {
      this._results[resultSetId] = [];
      response['results'].forEach(result => {
        this._results[resultSetId].push(new Result(result));
      });
      this.results$.next(this._results);

    }).subscribe();
  }


  // get_result(result_id) {
  // return this.httpService.postData('/result', {result_data: {id: result_id}})
  //   .then(
  //     result => {
  //       return new Result(result['result']);
  //     }, error => console.log(error));
  // }

  result_new(resultSets, description, status) {
    return this.httpService.postData('/result_new', {
      result_data: {
        message: description, status: status.name,
        result_set_id: resultSets.map(obj => obj.id)
      }
    }).map(res => {
      const newResult = new Result(res['result']);
      res['result_sets'].forEach(resultSet => {
        const newResultSet = new ResultSet(resultSet);

        this._resultSets[newResultSet.run_id.toString()][this._resultSets[newResultSet.run_id.toString()].findIndex(x => x.id === newResultSet.id)].status = newResultSet.status;

        if (this._results[newResultSet.id.toString()]) {
          this._results[newResultSet.id.toString()].push(newResult);
        }
      });
      this.resultSets$.next(this._resultSets);
      this.update_run_statistic(res['result_sets'][0]['run_id']);
      if (this._results) {
        this.results$.next(this._results);
      }
      // this.get_run(res['result_sets'][0]['run_id']);
    });
    // return this.reformat_response(res);
  }

  result_new_by_case(cases, message, status, runId) {
    const params = {result_set_data: {run_id: runId, name: []}, result_data: {message, status: status.name}};
    cases.forEach(currentCase => {
      params.result_set_data.name.push(currentCase.name);
    });
    return this.httpService.postData('/result_new', params).map(res => {
      res['result_sets'].forEach(resultSet => {
        this._resultSets[res['run'].id].push(new ResultSet(resultSet));
      });
      this.resultSets$.next(this._resultSets);
      this.update_run_statistic(runId);
    });
  }


  //#endregion

  //#region Result
  generate_invite(): void {
    this.httpService.postData('/create_invite_token', {}).map(res => {
      this.invite$.next(new Invite(res['invite_data']));
    }).subscribe();
  }

  get_invite(): void {
    this.httpService.postData('/get_invite_token', {}).map(res => {
      this.invite$.next(new Invite(res['invite_data']));
    }).subscribe();
  }

  reformat_response(res) {
    const response = {};
    if (res['result_sets']) {
      response['result_sets'] = res['result_sets'].map(result => new ResultSet(result));
    }
    if (res['result']) {
      response['result'] = new Result(res['result']);
    }
    return response;
  }

  //#endregion

  //#region UserSettigns
  get_user_setting() {
    this.httpService.postData('/user_setting', {}).map(userSettings => {
      this.userSettings.timeZone.next(userSettings['timezone']);
    }).subscribe();
  }

  timeZoneOffset(timeZone): string {
    const offset = timeZone.match(new RegExp('([-+]).*'));
    if (offset) {
      return offset[0];
    } else {
      return '+00:00';
    }
  }

  async edit_user_setting(timezone) {
    await this.httpService.postData('/user_setting_edit', {'user_settings': {'timezone': timezone}});
  }

  //#endregion
}
