import {Injectable} from '@angular/core';
import {HttpService} from './http-request.service';
import {AuthenticationService} from './authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Suite} from '../app/models/suite';
import {Run} from '../app/models/run';
import {Product} from '../app/models/product';
import {Plan} from '../app/models/plan';
import {Case} from '../app/models/case';
import {ResultSet} from '../app/models/result_set';
import {Result} from '../app/models/result';
import {History} from '../app/models/history_object';
import {Status} from '../app/models/status';
import {Invite} from '../app/models/invite';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {Statistic} from '../app/models/statistic';
import 'rxjs/Rx';
import {map} from "rxjs/operators";
import {NGXLogger} from 'ngx-logger';
import { delay } from 'rxjs/internal/operators';

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

export interface StructuredResultSets {
  [key: number]: ResultSet[];
}

export interface StructuredResults {
  [key: number]: Result[];
}


export interface UserSettings {
  timeZone: ReplaySubject<string> ;
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

  userSettings: UserSettings = {
    timeZone: new ReplaySubject(1)
  };

  statuses$: ReplaySubject<StructuredStatuses> = new ReplaySubject(1);
  private _statuses: StructuredStatuses = {};

  private _suites: StructuredSuites = {};

  plans: StructuredPlans = {};
  resultSets: StructuredResultSets = {};
  statuses: StructuredStatuses = {0: new Status({name: 'Untested', color: '#ffffff5c', id: 0, 'blocked': true})};
  statusObservable = new BehaviorSubject(this.statuses);
  response_results_data = {};
  response_runs_data = {};
  cases: Case[] = [];
  result_sets: ResultSet[] = [];
  histories: ResultSet[] = [];
  _timeZone: string;

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

  // get_status_by_id(id): Status {
  //   return this.statuses[id] || this.statuses[0];
  // }
  //
  // get_not_blocked_statuses(): Promise<Status[]> {
  //   return this.httpService.postData('/not_blocked_statuses', '').then((resp: any) => {
  //     const statuses = [];
  //     Object.keys(resp['statuses']).forEach(key => {
  //       statuses.push(new Status(resp['statuses'][key]));
  //     });
  //     return statuses;
  //   });
  // }
  //
  // block_status(id): Promise<JSON> {
  //   return this.httpService.postData('/status_edit', {status_data: {id: id, block: true}}).then((resp: any) => {
  //     return resp['status'];
  //   });
  // }
  //
  // update_status(id, name, color): Promise<Status> {
  //   return this.httpService.postData('/status_edit', {status_data: {id, name, color}}).then((resp: any) => {
  //     this.statuses[id] = new Status(resp['status']);
  //     this.statusObservable.next(this.statuses);
  //     return new Status(resp['status']);
  //   });
  // }
  //
  // async status_new(name, color) {
  //   const resp = await this.httpService.postData('/status_new', {status_data: {color: color, name: name}});
  //   return new Status(resp['status']);
  // }
  //
  // #endregion

  // //#region Token
  // async get_tokens() {
  //   return await this.httpService.postData('/tokens', '').then((resp: any) => {
  //     return resp['tokens'];
  //   }, (errors: any) => {
  //     console.log(errors);
  //     this.authenticationService.logout();
  //     this.router.navigate(['/singin']);
  //   });
  // }
  //
  // create_token(name: string): Promise<JSON> {
  //   return this.httpService.postData('/token_new', {token_data: {name: name}}).then((resp: any) => {
  //     return resp;
  //   });
  // }
  //
  // //#endregion
  //
  // #region Suite
  get_suites(productId: number): void {
    this.httpService.postData('/suites', {suite_data: {product_id: productId}}).map(response => {
      const suites = [];
      response['suites'].forEach(suite => {
        suites.push(new Suite(suite));
      });
      const product = this._products.find(product => product.id === productId);
      this._suites[productId] = suites;
      if (product) {
        this._products.find(product => product.id === productId).suites$.next(suites);
      }
    }).subscribe();
  }


  edit_suite_by_run_id(run, name, planId): void {
    const params = {suite_data: {run_id: run.id, name}};
    this.httpService.postData('/suite_edit', params).map(response => {
      const productId = response['suite']['product_id'];
      const suite = this._suites[productId][this._suites[productId].findIndex(x => x.id === response['suite'].id)];
      const runNew = this._runs[planId].find(currentRun => currentRun.name === run.name);
      runNew.name = response['suite']['name'];
      runNew.updated_at = response['suite']['updated_at'];
      suite.name = response['suite']['name'];
      suite.updated_at = response['suite']['updated_at'];
      this._products.find(product => product.id === productId).suites$.next(this._suites[productId]);
      this.runs$.next(this._runs);
    }).subscribe();
  }

  edit_suite(id, name): Promise<any> {
    return this.httpService.postData('/suite_edit', {suite_data: {name: name, id: id}}).then((resp: any) => {
      if (resp['errors']) {
        console.log('errors');
        return Promise.reject(resp['errors']);
      } else {
        console.log('all right');
        return Promise.resolve(new Suite(resp['suite']));
      }
    });
  }
  //
  // // async delete_suite(suiteId):Promise<boolean> {
  // //   return this.httpService.postData('/suite_delete', {suite_data: {id: suiteId}}).then(resp => {
  // //     if (resp.errors == null) {
  // //       console.log(this.suites[resp.suite.product_id]);
  // //       this.suites[resp.suite.product_id] = this.suites[resp.suite.product_id].filter(suite => suite.id !== suiteId);
  // //       return true;
  // //     } else {
  // //       return false
  // //     }
  // //   });
  // // }
  //
  // #endregion

  // //#region Cases
  // get_cases(id): Promise<any> {
  //   return this.httpService.postData('/cases', {case_data: {suite_id: id}}).then((resp: any) => {
  //     this.cases = [];
  //     Object(resp['cases']).forEach(current_case => {
  //       this.cases.push(new Case(current_case));
  //     });
  //     return this.cases;
  //   }, (errors: any) => {
  //     console.log(errors);
  //   });
  // }
  //
  // get_cases_by_run_id(run_id, product_id): Promise<any> {
  //   return this.httpService.postData('/cases', {
  //     case_data: {
  //       run_id: run_id,
  //       product_id: product_id
  //     }
  //   }).then((resp: any) => {
  //     this.cases = [];
  //     Object(resp['cases']).forEach(current_case => {
  //       this.cases.push(new Case(current_case));
  //     });
  //     return this.cases;
  //   }, (errors: any) => {
  //     console.log(errors);
  //   });
  // }
  //
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
  // async delete_case(caseId, productId) {
  //   const resp = await this.httpService.postData('/case_delete', {case_data: {id: caseId}});
  //   const _case = new Case(resp['case']);
  //   const _suite = this.suites[productId].find(suite => suite.id === _case.suite_id);
  //   const statisticData = _suite.statistic.data;
  //   statisticData[0] = statisticData[0] - 1;
  //   _suite.statistic = new Statistic(statisticData);
  //   return _case;
  // }
  //
  // history = async (case_id) => {
  //   const resp = await this.httpService.postData('/case_history', {case_data: {id: case_id}});
  //   this.histories = [];
  //   resp['result_sets_history'].forEach(data => {
  //     this.histories.push(new History(data));
  //   });
  //   return this.histories;
  // };
  //
  // //#endregion

  //#region Run
  get_runs(planId): void {
    this.httpService.postData('/runs', {run_data: {plan_id: planId}}).map(
        response => {
          this._runs[planId] = [];
          response['runs'].forEach(run => {
            this._runs[planId].push(new Run(run));
          });
          this.runs$.next(this._runs);
        }).subscribe();
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
    if (!this._runs[planId]) {
      this.get_runs(planId);
    }
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

  //#endregion

  //#region Products
  get_products(): void {
    this.httpService.postData('/products', '').map(response => {
      this._products = response['products'].map(product => new Product(product));
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
    return this.httpService.postData('/set_product_position', {product_position: productIds});
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
        this.logger.debug('get_plans_statistic. statistic:');
        if (!this._runs[planId]) {
          this.logger.debug('get_plans_statistic. Statistic sended runs is not  exist');
          this._plans[productId].find(plan => plan.id === planId).statistic$.next(statistic);
        }
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
    return this.httpService.postData('/plan_archive', {plan_data: {id: planId}}).then(response => {
      console.log(response);
    });
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
    }).subscribe();
  }

  delete_result_set(id, runId): void {
    this.httpService.postData('/result_set_delete', {result_set_data: {id}}).map(result_set => {
      this.get_run(runId);
      this._resultSets[runId] = this._resultSets[runId].filter(resultSet => resultSet.id !== id);
      this.resultSets$.next(this._resultSets);
    }).subscribe();
  }

  // //#endregion

  // //#region Result
  get_results(resultSetId) {
    this.httpService.postData('/results', {result_data: {result_set_id: resultSetId}}).map(response => {
      this._results[resultSetId] = [];
      response['results'].forEach(result => {
        this._results[resultSetId].push(new Result(result));
      });
      this.results$.next(this._results);

    }).subscribe();
  }


  get_result(result_id): Promise<any> {
    return this.httpService.postData('/result', {result_data: {id: result_id}})
      .then(
        result => {
          return new Result(result['result']);
        }, error => console.log(error));
  }
  //
  // async result_new(result_sets, description, status) {
  //   if (result_sets.length == 0) {
  //     return {};
  //   }
  //   const res = await this.httpService.postData('/result_new', {
  //     result_data: {
  //       message: description, status: status.name,
  //       result_set_id: result_sets.map(obj => obj.id)
  //     }
  //   });
  //   return this.reformat_response(res);
  // }
  //
  // async result_new_by_case(cases, message, status, run_id) {
  //   if (cases.length == 0) {
  //     return {};
  //   }
  //   const params = {result_set_data: {run_id: run_id, name: []}, result_data: {message: message, status: status.name}};
  //   for (const this_case of cases) {
  //     params.result_set_data.name.push(this_case.name);
  //   }
  //   const res = await this.httpService.postData('/result_new', params);
  //   return this.reformat_response(res);
  // }
  //
  // //#endregion

  // //#region Result
  // async generate_invite() {
  //   const response = await this.httpService.postData('/create_invite_token', {});
  //   return new Invite(response['invite_data']);
  // }
  //
  // async get_invite() {
  //   let invite = null;
  //   const data = await this.httpService.postData('/get_invite_token', {});
  //   if (data['invite_data']) {
  //     invite = new Invite(data['invite_data']);
  //   }
  //   return invite;
  // }
  //
  // reformat_response(res) {
  //   const response = {};
  //   if (res['result_sets']) {
  //     response['result_sets'] = res['result_sets'].map(result => new ResultSet(result));
  //   }
  //   if (res['result']) {
  //     response['result'] = new Result(res['result']);
  //   }
  //   return response;
  // }
  //
  // //#endregion

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
