import { Injectable } from '@angular/core';
import { HttpService } from './http-request.service';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { Suite } from '../app/models/suite';
import { Run } from '../app/models/run';
import { Product } from '../app/models/product';
import { Plan } from '../app/models/plan';
import { Case } from '../app/models/case';
import { ResultSet } from '../app/models/result_set';
import { Result } from '../app/models/result';
import { History } from '../app/models/history_object';
import { Status } from '../app/models/status';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { Statistic } from '../app/models/statistic';
import { NGXLogger } from 'ngx-logger';
import { Invite } from "../app/models/invite";
import { map, switchMap, take } from 'rxjs/operators';

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

  historyPack$: ReplaySubject<ResultSet[]> = new ReplaySubject(1);
  historyResults$: BehaviorSubject<StructuredResults> = new BehaviorSubject({});
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
  currentCases$: ReplaySubject<Case[]> = new ReplaySubject(1);
  currentResultSets$: ReplaySubject<ResultSet[]> = new ReplaySubject(1);

  invite$: ReplaySubject<Invite> = new ReplaySubject(1);

  resultSets: StructuredResultSets = {};
  statuses: StructuredStatuses = { 0: new Status({ name: 'Untested', color: '#ffffff5c', id: 0, 'blocked': true }) };
  cases: Case[] = [];
  result_sets: ResultSet[] = [];
  // histories: ResultSet[] = [];
  // _timeZone: string;

  constructor(private router: Router, private httpService: HttpService,
    private authenticationService: AuthenticationService, private logger: NGXLogger) {
  }

  // #region Status
  get_statuses(): void {
    this.httpService.postData('/statuses', '').pipe(map(resp => {
      this._statuses = { 0: new Status({ name: 'Untested', color: '#efefef', id: 0, 'block': true }) };
      Object.keys(resp['statuses']).forEach(key => {
        const statusNew = new Status(resp['statuses'][key]);
        this._statuses[statusNew.id] = statusNew;
      });
      this.statuses$.next(this._statuses);
    })).subscribe();
  }

  block_status(id): void {
    this.httpService.postData('/status_edit', { status_data: { id, block: true } }).subscribe(response => {
      this._statuses[id] = new Status(response['status']);
      this.statuses$.next(this._statuses);
    });
  }

  update_status(id, name, color): void {
    this.httpService.postData('/status_edit', { status_data: { id, name, color } }).subscribe(response => {
      this._statuses[id] = new Status(response['status']);
      this.statuses$.next(this._statuses);
    });
  }

  status_new(name, color): void {
    this.httpService.postData('/status_new', { status_data: { color, name } }).subscribe(response => {
      const newStatus = new Status(response['status']);
      this._statuses[newStatus.id] = newStatus;
      this.statuses$.next(this._statuses);
    });
  }

  // #endregion

  // //#region Token
  get_tokens(): Observable<Token[]> {
    return this.httpService.postData('/tokens', '').pipe(map((resp: RequestToken) => {
      return resp.tokens;
    }));
  }

  create_token(name: string): Observable<Token[]> {
    return this.httpService.postData('/token_new', { token_data: { name } }).pipe(map(resp => {
      return resp['token_data'];
    }));
  }

  // //#endregion
  //
  // #region Suite
  get_suites(productId: number): void {
    this.httpService.postData('/suites', { suite_data: { product_id: productId } }).pipe(map(response => {
      const suites = [];
      response['suites'].forEach(suite => {
        suites.push(new Suite(suite));
      });
      this._suites[productId] = suites;
      this.suites$.next(this._suites);
      this.case_count(productId);
    })).subscribe();
  }

  case_count(productId) {
    this.products$.pipe(take(1)).subscribe(products => {
      const product = products.find(product => product.id === +productId);
      let count = 0;
      this._suites[productId].forEach(suite => {
        count += suite.caseCount;
      });
      product.caseCount$.next(count);
    });
  }


  edit_suite_by_run_id(run, name, planId): void {
    const params = { suite_data: { run_id: run.id, name } };
    this.httpService.postData('/suite_edit', params).pipe(map(response => {
      this.update_suite(response);
      const runNew = this._runs[planId].find(currentRun => currentRun.name === run.name);
      runNew.name = response['suite']['name'];
      runNew.updated_at = response['suite']['updated_at'];
      this.runs$.next(this._runs);
    })).subscribe();
  }

  update_suite(response) {
    const productId = response['suite']['product_id'];
    const suite = this._suites[productId][this._suites[productId].findIndex(x => x.id === response['suite'].id)];
    suite.name = response['suite']['name'];
    suite.updated_at = response['suite']['updated_at'];
    this.suites$.next(this._suites);
  }

  edit_suite(id, name): void {
    this.httpService.postData('/suite_edit', { suite_data: { name, id } }).pipe(map(response => {
      this.update_suite(response);
    })).subscribe();
  }


  delete_suite(suiteId: number, plan: Plan): void {
    this.httpService.postData('/suite_delete', { suite_data: { id: suiteId, plan_id: plan.id } }).pipe(map(response => {
      plan.suites$.pipe(take(1), map((suites: Suite[]) => {
        plan.suites$.next(suites.filter(suite => suite.id !== response['suite']['id']));
      })).subscribe()
      plan.caseCount$.next(response['plan']['case_count']);
      // const productId = response['suite']['product_id'];
      // this._suites[productId] = this._suites[productId].filter(suite => suite.id !== response['suite']['id']);
      // this.suites$.next(this._suites);
    })).subscribe();
  }

  // #endregion

  // //#region Cases
  get_cases(id, planId): void {
    this.httpService.postData('/cases', { case_data: { suite_id: id, plan_id: planId } }).pipe(map(resp => {
      this._cases[id] = [];
      Object(resp['cases']).forEach(currentCase => {
        this._cases[id].push(new Case(currentCase));
      });
      this.cases$.next(this._cases);
    })).subscribe();
  }

  get_cases_by_run_id(runId: string, productId, planId): Observable<[Case[], string]> {
    return this.httpService.postData('/cases', {
      case_data: {
        run_id: runId,
        product_id: productId,
        plan_id: planId
      }
    }).pipe(map(resp => {
      const _cases = [];
      Object(resp['cases']).forEach(currentCase => {
        _cases.push(new Case(currentCase));
      });
      this._cases[resp['suite']['id']] = _cases;
      this.cases$.next(this._cases);
      return [_cases, runId]
    }));
  }

  edit_case_by_result_set_id(resultSetId, runId, name): void {
    this.httpService.postData('/case_edit', { case_data: { result_set_id: resultSetId, name } }).pipe(map(response => {
      this._resultSets[runId][this._resultSets[runId].findIndex(x => x.id === resultSetId)].name = name;
      this.resultSets$.next(this._resultSets);
    })).subscribe();
  }

  //
  // async edit_case(case_id, name) {
  //   const resp = await this.httpService.postData('/case_edit', {case_data: {id: case_id, name: name}});
  //   return new Case(resp['case']);
  // }
  //
  delete_case(caseId, productId, plan_id): void {
    this.delete_case_obs(caseId, productId, plan_id).subscribe();
  }

  delete_case_obs(caseId, productId, plan_id) {
    if (!(caseId instanceof Array)) {
      caseId = [caseId]
    }
    return this.httpService.postData('/case_delete', { case_data: { id: caseId, plan_id: plan_id } }).pipe(map(response => {
      const suiteId = response['case']['suite_id'];
      this._cases[suiteId] = this._cases[suiteId].filter(_case => !caseId.includes(_case.id));
      this.cases$.next(this._cases);
      this.currentCases$.next(this._cases[suiteId]);
      const plan = this._plans[productId].find(plan => plan.id == plan_id);
      plan.suites$.pipe(take(1), map(suites => {
        suites.find(suite => suite.id == suiteId).decrease_case_count(caseId.length);
        plan.recalculate_case_count();
      })).subscribe()
    }))
  }

  get_history(caseData: ({ id: number } | { result_set_id: number })): void {
    this.httpService.postData('/case_history', { case_data: caseData }).pipe(map(resp => {
      const productId = resp['product_id'];
      const suiteName = resp['suite_name'];
      this._historyPack[productId] = this._historyPack[productId] || {};
      this._historyPack[productId][suiteName] = [];
      let history = []
      resp['result_sets_history'].forEach(data => {
        history.push(new History(data));
      });
      this.historyPack$.next(history);
    })).subscribe();
  }

  //#endregion

  //#region Run
  get_runs(planId: number): Observable<ReplaySubject<Run[]>> {
    return this.httpService.postData('/runs', { run_data: { plan_id: planId } }).pipe(map(
      response => {
        let runs = []
        const plan = this._plans[response['plan']['product_id']].find(plan => plan.id == response['plan']['id']);
        let newSuites = [];
        response['suites'].forEach(suite => {
          newSuites.push(new Suite(suite));
        });
        response['runs'].forEach(run => {
          runs.push(new Run(run));
        });

        plan.suites$.next(newSuites);
        plan.runs$.next(runs);
        return plan.runs$;
      }));
  }

  get_suite_imp(product, planId) {
    return this._plans[product].find(plan => plan.id === planId).suites$;
  }

  get_run(runId): void {
    this.httpService.postData('/run', { run_data: { id: runId } }).pipe(map(
      response => {
        const newRun = new Run(response['run']);
        const oldRunIndex = this._runs[newRun.plan_id].findIndex(run => run.id === response['run']['id']);
        newRun.update_point_statuses(this._runs[newRun.plan_id][oldRunIndex].statistic.points);
        this._runs[newRun.plan_id][oldRunIndex] = newRun;
        this.runs$.next(this._runs);
      })).subscribe();
  }

  init_runs(planId: number): void {
    this.get_runs(planId).subscribe();
  }

  update_runs(planId: number) {
    this.get_runs(planId).pipe(take(1), switchMap(runs$ => {
      return runs$.pipe(map(x => {
        console.log(x)
      }))
    })).subscribe();
  }

  create_run(runName: string, planId: number): Observable<Run> {
    return this.httpService.postData('/run_new', { run_data: { plan_id: planId, name: runName } }).pipe(map(res => {
      // change link to array for trigger unpure pipes
      const newRun = new Run(res['run']);
      if(!!this._runs[res['plan']['id']]) {
        this._runs[res['plan']['id']] = this._runs[res['plan']['id']].slice(0);
      } else {
        this._runs[res['plan']['id']] = [];
      }
      const plan_index = this._plans[res['plan'].product_id].findIndex(x => x.id === planId);
      const plan = this._plans[res['plan'].product_id][plan_index];
      this._runs[res['plan']['id']].push(newRun);
      this.runs$.next(this._runs);
      plan.runs$.next(this._runs[res['plan']['id']])
      return newRun;
    }));
  }

  delete_run(run: Run, plan: Plan): void {
    this.httpService.postData('/run_delete', { run_data: { id: run.id } }).pipe(map(result => {
      plan.runs$.pipe(take(1), map(runs => {
        console.log(runs.filter(currentRun => currentRun.id !== run.id))
        plan.runs$.next(runs.filter(currentRun => currentRun.id !== run.id))
      })).subscribe()
      this._runs[run.plan_id] = this._runs[run.plan_id].filter(currentRun => currentRun.id !== run.id);
      this.runs$.next(this._runs);
    })).subscribe();
  }

  run_name_by_id(runId: number, planId: number): string {
    return this._runs[planId].find(run => run.id === runId).name;
  }

  //#endregion

  //#region Products
  get_products(): void {
    this.get_products_obs().subscribe();
  }

  get_products_obs() {
    return this.httpService.postData('/products', '').pipe(map(response => {
      this._products = response['products'].map(product => new Product(product));
      // Object.keys(this._suites).forEach(productId => {
      //   this._products.find(product => {
      //     return product.id === +productId;
      //   }).suites$.next(this._suites[productId]);
      // });
      this.products$.next(this._products);
    }))
  }

  create_product(name: string): Observable<{ product: Product, request_status: string }> {
    return this.httpService.postData('/product_new', { product_data: { name: name} })
      .pipe(map(response => {
        this.logger.debug('product_new. name: ', name);
        const _product = new Product(response['product']);
        if (!response['request_status']) {
          this._products.push(_product);
          this.products$.next(this._products);
        }
        return { product: _product, request_status: response['request_status'] }
      }));
  }

  delete_product(id): void {
    this.httpService.postData('/product_delete', { product_data: { id } }).pipe(map(result => {
      this._products = this._products.filter(product => product.id !== id);
      this.products$.next(this._products);
    })).subscribe();
  }

  edit_product(id, name): void {
    this.httpService.postData('/product_edit', { product_data: { name, id } }).pipe(map(result => {
      this._products[this._products.findIndex(x => x.id === result['product'].id)] = new Product(result['product']);
      this.products$.next(this._products);
    })).subscribe();
  }

  send_product_position(productIds) {
    return this.httpService.postData('/set_product_position', { product_position: productIds }).subscribe();
  }

  //#endregion

  //#region Plans
  get_plans(params) {
    const productId = params['plan_data']['product_id'];
    return this.httpService.postData('/plans', params).pipe(map(response => {
      if (response['plans'].length !== 0) {
        response['plans'].forEach(plan => {
          const _plan = new Plan(plan);
          this._plans[productId].push(_plan);
        });
        const plansId = Object(response['plans']).map(plan => plan.id);
        this.get_plans_statistic(plansId, productId);
      }
      this.plans$.next(this._plans);
      return { plans: this._plans, request_status: response['request_status'] }
    }));
  }

  oldest_plan(productId): number {
    return this._plans[productId].reduce((min, p) => p.id < min ? p.id : min, this._plans[productId][0].id);
  }

  init_plans(productId: number, planId: (number | undefined)): void {
    this.logger.debug('init_plans. productId: ' + productId);
    if (!this._plans[productId]) {
      this._plans[productId] = [];
      const params = { plan_data: { product_id: productId } };
      if (planId) {
        params['plan_data']['plan_id'] = planId;
      }
      this.get_plans(params).subscribe();
    } else {
      this.plans$.next(this._plans);
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

  get_plans_show_more(productId: number) {
    const params = { plan_data: { product_id: productId, after_plan_id: this.oldest_plan(productId) } };
    return this.get_plans(params);
  }

  get_plans_statistic(planIds: number[], productId: number): void {
    this.get_plans_statistic_obj(planIds, productId).subscribe();
  }

  get_plans_statistic_obj(planIds: number[], productId: number) {
    return this.httpService.postData('/plans_statistic', { plan_data: planIds }).pipe(map(response => {
      let plans = {};
      planIds.forEach(planId => {
        const statistic: Statistic = new Statistic(this.reformatted_statistic_data(response['statistic'][planId]));
        const plan = this._plans[productId].find(plan => plan.id === planId);
        plan.statistic$.next(statistic);
        plans[planId] = plan;
      });
      return plans;
    }));
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

  create_plan(name: String, product_id: Number): Observable<{ plan: Plan, request_status: string }> {
    return this.httpService.postData('/plan_new', { plan_data: { name: name, api_created: false, product_id: product_id } })
      .pipe(map(response => {
        this.logger.debug('plan_new. name: ', name);
        const _plan = new Plan(response['plan']);
        if (!response['request_status']) {
          this._plans[_plan.product_id].push(_plan);
          this.plans$.next(this._plans);
        }
        return { plan: _plan, request_status: response['request_status'] }
      }));
  }

  edit_plan(id, name): void {
    this.httpService.postData('/plan_edit', { plan_data: { plan_name: name, id } })
      .pipe(map(response => {
        this.logger.debug('edit_plan. id: ', id, '; name: ', name);
        const productId = response['plan'].product_id;
        const plan = this._plans[productId][this._plans[productId].findIndex(x => x.id === response['plan'].id)];
        plan.name = response['plan']['name'];
        plan.updated_at = response['plan']['updated_at'];
        this.plans$.next(this._plans);
        this.get_plans_statistic([plan.id], productId);
      })).subscribe();
  }

  archive_plane(planId) {
    this.httpService.postData('/plan_archive', { plan_data: { id: planId } }).pipe(map(res => {
      console.log(res);
    }
    )).subscribe();
  }

  delete_plan(id): void {
    this.httpService.postData('/plan_delete', { plan_data: { id } }).pipe(map(result => {
      const productId = result['plan']['product_id'];
      this._plans[productId] = this._plans[productId].filter(plan => plan.id !== id);
      this.plans$.next(this._plans);
    })).subscribe();
  }

  //#endregion

  // //#region Result Set
  get_result_sets(runId: number, productId: number) {
    return this.httpService.postData('/result_sets', { result_set_data: { run_id: runId } }).pipe(switchMap(response => {
      return this.plans$.pipe(take(1), switchMap((strPlans: StructuredPlans) => {
        return strPlans[productId].find(plan => plan.id == response['run']['plan_id']).runs$.pipe(take(1), map(runs => {
          this._resultSets[runId] = [];
          response['result_sets'].forEach(resultSet => {
            this._resultSets[runId].push(new ResultSet(resultSet));
          });
          runs.find(run => run.id == runId).resultSets$.next(this._resultSets[runId])
        }))
      }))
    }));
  }

  delete_result_set(id: number, runId: number) {
    return this.httpService.postData('/result_set_delete', { result_set_data: { id } });
  }

  delete_all_result_sets(ids: number[], runId: number) {
    return this.httpService.postData('/result_set_delete', { result_set_data: { id: ids } });
  }
  //#endregion

  //#region Result
  get_results(resultSetId) {
    this.get_results_obs(resultSetId).subscribe();
  }

  get_results_obs(resultSetId: number) {
    return this.httpService.postData('/results', { result_data: { result_set_id: resultSetId } }).pipe(map(response => {
      if (response['errors']) {
        throw response['errors'];
      }
      return response
    }), switchMap(response => {
      return this.plans$.pipe(take(1), switchMap((strPlans: StructuredPlans) => {
        return strPlans[response['product_id']].find(plan => plan.id == response['result_set']['plan_id']).runs$.pipe(take(1), switchMap(runs => {
          return runs.find(run => run.id == response['result_set']['run_id']).resultSets$.pipe(take(1), map(resultSets => {
            let resultSet = resultSets.find(resultSet => resultSet.id == resultSetId)
            let results = [];
            response['results'].forEach(result => {
              results.push(new Result(result));
            });
            resultSet.results$.next(results)
            return resultSet.results$
          }))
        }))
      }))
    }));
  }

  get_results_for_history(resultSetId: number) {
    return this.httpService.postData('/results', { result_data: { result_set_id: resultSetId } }).pipe(map(response => {
      let historicalResults = [];
      response['results'].forEach(result => {
        historicalResults.push(new Result(result));
      });
      let newHistoryResults = this.historyResults$.getValue();
      newHistoryResults[response['result_set']['id']] = historicalResults
      this.historyResults$.next(newHistoryResults);
      return response['result_set']['id'];
    }));
  }

  get_result(resultId) {
    return this.httpService.postData('/result', { result_data: { id: resultId } }).pipe(map(res => new Result(res['result'])));
  }

  result_new(resultSets, description, status, activeResultSet, activeRun) {
    return this.httpService.postData('/result_new', {
      result_data: {
        message: description, status: status.name,
        result_set_id: resultSets.map(obj => obj.id)
      }
    }).pipe(map(responce => {
      activeRun.resultSets$.pipe(take(1), map((resultSets: ResultSet[]) => {
        responce['result_sets'].forEach(resultSet => {
          const newResultSet = new ResultSet(resultSet);
          resultSets.find(x => x.id == newResultSet.id).status = newResultSet.status;
        });
        activeRun.resultSets$.next(resultSets)
      })).subscribe();

      return responce;
    }), map(response => {
      if (response['result_sets'].some(rs => rs['id'] == activeResultSet?.id)) {

        activeResultSet.results$.pipe(take(1)).subscribe(results => {
          let newResults = [...results]
          let newResult = new Result(response['result'])
          newResults.push(newResult)
          activeResultSet.results$.next(newResults)
        })
      }
      return response;
    }));
  }

  result_new_by_case(cases, message, status, runId) {
    const params = { result_set_data: { run_id: runId, name: [] }, result_data: { message, status: status.name } };
    cases.forEach(currentCase => {
      params.result_set_data.name.push(currentCase.name);
    });
    return this.httpService.postData('/result_new', params).pipe(map(res => {
      return res;
    }));
  }
  //#endregion

  //#region Result
  generate_invite(): void {
    this.httpService.postData('/create_invite_token', {}).pipe(map(res => {
      this.invite$.next(new Invite(res['invite_data']));
    })).subscribe();
  }

  get_invite(): void {
    this.httpService.postData('/get_invite_token', {}).pipe(map(res => {
      this.invite$.next(new Invite(res['invite_data']));
    })).subscribe();
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
    this.httpService.postData('/user_setting', {}).pipe(map(userSettings => {
      this.userSettings.timeZone.next(userSettings['timezone']);
    })).subscribe();
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
    await this.httpService.postData('/user_setting_edit', { 'user_settings': { 'timezone': timezone } });
  }

  //#endregion
}
