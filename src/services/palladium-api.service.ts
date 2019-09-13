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
import {Invite} from '../app/models/invite';
import {BehaviorSubject} from 'rxjs';
import {Statistic} from '../app/models/statistic';

export interface StructuredStatuses {
  [key: number]: Status;
}

export interface StructuredPlans {
  [key: number]: Plan[];
}

export interface StructuredResultSets {
  [key: number]: ResultSet[];
}

export interface StructuredPlansStatistic {
  [key: number]: Statistic;
}

@Injectable()
export class PalladiumApiService {
  plans: StructuredPlans = {};
  suites = {};
  resultSets: StructuredResultSets = {};
  statuses: StructuredStatuses = {0: new Status({name: 'Untested', color: '#ffffff5c', id: 0, 'blocked': true})};
  statusObservable = new BehaviorSubject(this.statuses);
  plansStatistic: StructuredPlansStatistic = {};
  response_results_data = {};
  response_runs_data = {};
  cases: Case[] = [];
  result_sets: ResultSet[] = [];
  histories: ResultSet[] = [];
  _timeZone: string;

  constructor(private router: Router, private httpService: HttpService,
              private authenticationService: AuthenticationService) {
  }

  //#region Status
  get_statuses(): void {
    this.httpService.postData('/statuses', '').then(resp => {
      this.statuses = {0: new Status({name: 'Untested', color: '#efefef', id: 0, 'block': true})};
      Object.keys(resp['statuses']).forEach(key => {
        const statusNew = new Status(resp['statuses'][key]);
        this.statuses[statusNew.id] = statusNew;
      });
    }).then(() => {
      this.statusObservable.next(this.statuses);
    });
  }

  get_status_by_id(id): Status {
    return this.statuses[id] || this.statuses[0];
  }

  get_not_blocked_statuses(): Promise<Status[]> {
    return this.httpService.postData('/not_blocked_statuses', '').then((resp: any) => {
      const statuses = [];
      Object.keys(resp['statuses']).forEach(key => {
        statuses.push(new Status(resp['statuses'][key]));
      });
      return statuses;
    });
  }

  block_status(id): Promise<JSON> {
    return this.httpService.postData('/status_edit', {status_data: {id: id, block: true}}).then((resp: any) => {
      return resp['status'];
    });
  }

  update_status(id, name, color): Promise<Status> {
    return this.httpService.postData('/status_edit', {status_data: {id, name, color}}).then((resp: any) => {
      this.statuses[id] = new Status(resp['status']);
      this.statusObservable.next(this.statuses);
      return new Status(resp['status']);
    });
  }

  async status_new(name, color) {
    const resp = await this.httpService.postData('/status_new', {status_data: {color: color, name: name}});
    return new Status(resp['status']);
  }

  //#endregion

  //#region Token
  async get_tokens() {
    return await this.httpService.postData('/tokens', '').then((resp: any) => {
      return resp['tokens'];
    }, (errors: any) => {
      console.log(errors);
      this.authenticationService.logout();
      this.router.navigate(['/singin']);
    });
  }

  create_token(name: string): Promise<JSON> {
    return this.httpService.postData('/token_new', {token_data: {name: name}}).then((resp: any) => {
      return resp;
    });
  }

  //#endregion

  //#region Suite
  async get_suites(productId) {
    const response = await this.httpService.postData('/suites', {suite_data: {product_id: productId}});
    this.suites[productId] = [];
    Object(response['suites']).forEach(suite => {
      this.suites[productId].push(new Suite(suite));
    });
  }

  edit_suite_by_run_id(run_id, name): Promise<any> {
    const params = {suite_data: {run_id: run_id, name: name}};
    return this.httpService.postData('/suite_edit', params).then((resp: any) => {
      if (resp['errors']) {
        return Promise.reject(resp['errors']);
      } else {
        return Promise.resolve(new Suite(resp['suite']));
      }
    });
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

  async delete_suite(suite_id) {
    const resp = await this.httpService.postData('/suite_delete', {suite_data: {id: suite_id}});
    return new Suite(resp['suite']);
  }

  //#endregion

  //#region Cases
  get_cases(id): Promise<any> {
    return this.httpService.postData('/cases', {case_data: {suite_id: id}}).then((resp: any) => {
      this.cases = [];
      Object(resp['cases']).forEach(current_case => {
        this.cases.push(new Case(current_case));
      });
      return this.cases;
    }, (errors: any) => {
      console.log(errors);
    });
  }

  get_cases_by_run_id(run_id, product_id): Promise<any> {
    return this.httpService.postData('/cases', {
      case_data: {
        run_id: run_id,
        product_id: product_id
      }
    }).then((resp: any) => {
      this.cases = [];
      Object(resp['cases']).forEach(current_case => {
        this.cases.push(new Case(current_case));
      });
      return this.cases;
    }, (errors: any) => {
      console.log(errors);
    });
  }

  async edit_case_by_result_set_id(result_set_id, name): Promise<any> {
    const resp = await this.httpService.postData('/case_edit', {case_data: {result_set_id: result_set_id, name: name}});
    return new Case(resp['case']);
  }

  async edit_case(case_id, name) {
    const resp = await this.httpService.postData('/case_edit', {case_data: {id: case_id, name: name}});
    return new Case(resp['case']);
  }

  async delete_case(caseId, productId) {
    const resp = await this.httpService.postData('/case_delete', {case_data: {id: caseId}});
    const _case = new Case(resp['case']);
    const _suite = this.suites[productId].find(suite => suite.id === _case.suite_id);
    const statisticData = _suite.statistic.data;
    statisticData[0] = statisticData[0] - 1;
    _suite.statistic = new Statistic(statisticData);
    return _case;
  }

  history = async (case_id) => {
    const resp = await this.httpService.postData('/case_history', {case_data: {id: case_id}});
    this.histories = [];
    resp['result_sets_history'].forEach(data => {
      this.histories.push(new History(data));
    });
    return this.histories;
  };

  //#endregion

  //#region Run
  get_runs(plan_id): Promise<any> {
    return this.httpService.postData('/runs', {run_data: {plan_id: plan_id}})
      .then(
        (resp: any) => {
          this.response_runs_data[plan_id] = [];
          resp['runs'].forEach(run => {
            this.response_runs_data[plan_id].push(new Run(run));
          });
          return this.response_runs_data;
        }, (errors: any) => {
          console.log(errors);
        });
  }

  create_run(run_name, plan_id): Promise<any> {
    return this.httpService.postData('/run_new', {run_data: {plan_id: plan_id, name: run_name}})
      .then(
        (resp: any) => {
          return new Run(resp['run']);
        }, (errors: any) => {
          console.log(errors);
        });
  }

  async delete_run(run_id) {
    return await this.httpService.postData('/run_delete', {run_data: {id: run_id}})['run'];
  }

  //#endregion

  //#region Products
  products = async () => {
    const product_pack = await this.httpService.postData('/products', '');
    return product_pack['products'].map(product => new Product(product));
  };

  async delete_product(id) {
    return await this.httpService.postData('/product_delete', {product_data: {id: id}});
  }

  async edit_product(id, name) {
    try {
      const product = await this.httpService.postData('/product_edit', {product_data: {name: name, id: id}});
      return new Product(product['product']);
    } catch (error) {
      console.log(error);
    }
  }

  //#endregion

  //#region Products
  send_product_position(productIds) {
    return this.httpService.postData('/set_product_position', {product_position: productIds});
  }

  //#endregion

  //#region Plans
  async get_plans(productId): Promise<boolean> {
    let offset = 0;
    if (this.plans[productId]) {
      offset = this.plans[productId].length;
    }
    const response = await this.httpService.postData('/plans', {plan_data: {product_id: productId, offset}});
    const tmpPlans = [];
    const planIds = Object(response['plans']).map(plan => plan.id);
    const statisticPromise = this.get_plans_statistic(planIds);

    Object(response['plans']).forEach(plan => {
      const _plan = new Plan(plan);
      _plan.statistic$ = statisticPromise.then(statisticAll => {
        return statisticAll[_plan.id];
      });
      tmpPlans.push(_plan);
    });
    if (this.plans[productId]) {
      this.plans[productId] = this.plans[productId].concat(tmpPlans);
    } else {
      this.plans[productId] = tmpPlans;
    }
    return tmpPlans.length === 0; // there are not more plans for loading
  }

  get_plans_statistic(planIds):Promise<StructuredPlansStatistic>{
      return this.httpService.postData('/plans_statistic', {plan_data: planIds}).then(response => {
        const statistics = {};
        Object.keys(response['statistic']).forEach(planId => {
          statistics[planId] = new Statistic(this.reformatted_statistic_data(response['statistic'][planId]));
        });
        return statistics;
      });
  }

  // method for reformat statistic data from [{plan_id: 1, count:2, status:3}, {}, {}] to
  reformatted_statistic_data(data) {
    const _statistic = {};
    data.forEach(i => {
      _statistic[i.status] = i.count;
    });
    return _statistic;
  }

  async get_plans_to_id(productId, planId) {
    const response = await this.httpService.postData('/plans', {plan_data: {product_id: productId, plan_id: planId}});
    const tmpPlans = [];
    const planIds = Object(response['plans']).map(plan => plan.id);
    const statisticPromise = this.get_plans_statistic(planIds);

    Object(response['plans']).forEach(plan => {
      const _plan = new Plan(plan);
      _plan.statistic$ = statisticPromise.then(statisticAll => {
        return statisticAll[_plan.id];
      });
      tmpPlans.push(_plan);
    });
    if (this.plans[productId]) {
      this.plans[productId] = this.plans[productId].concat(tmpPlans);
    } else {
      this.plans[productId] = tmpPlans;
    }
    return tmpPlans === []; // there are not more plans for loading
  }

  case_count(productId) {
    let casesCount = 0;
    if (this.suites[productId]) {
      this.suites[productId].forEach(suite => {
        casesCount += suite.statistic.all;
      });
    }
    return casesCount;
  }

  edit_plan(id, name): Promise<any> {
    return this.httpService.postData('/plan_edit', {plan_data: {plan_name: name, id: id}})
      .then((resp: any) => {
        if (resp['errors']) {
          return Promise.reject(resp['errors']);
        } else {
          // return Promise.resolve(new Plan(resp['plan']));
          return Promise.resolve({});
        }
      });
  }

  async delete_plan(id) {
    return await this.httpService.postData('/plan_delete', {plan_data: {id: id}})['plan'];
  }

  //#endregion

  //#region Result Set
  async get_result_sets(runId): Promise<any> {
    const resp = await this.httpService.postData('/result_sets', {result_set_data: {run_id: runId}});
    this.resultSets[runId] = [];
    Object(resp['result_sets']).forEach(resultSet => {
      this.resultSets[runId].push(new ResultSet(resultSet));
    });
  }

  async delete_result_set(id) {
    const result_set = await this.httpService.postData('/result_set_delete', {result_set_data: {id: id}});
    return result_set['result_set']['id'];
  }

  //#endregion

  //#region Result
  results = async (result_set_id) => {
    const response = await this.httpService.postData('/results', {result_data: {result_set_id: result_set_id}});
    this.response_results_data[result_set_id] = [];
    Object(response['results']).forEach(result => {
      this.response_results_data[result_set_id].push(new Result(result));
    });
    return this.response_results_data[result_set_id];
  };

  get_result(result_id): Promise<any> {
    return this.httpService.postData('/result', {result_data: {id: result_id}})
      .then(
        result => {
          return new Result(result['result']);
        }, error => console.log(error));
  }

  async result_new(result_sets, description, status) {
    if (result_sets.length == 0) {
      return {};
    }
    const res = await this.httpService.postData('/result_new', {
      result_data: {
        message: description, status: status.name,
        result_set_id: result_sets.map(obj => obj.id)
      }
    });
    return this.reformat_response(res);
  }

  async result_new_by_case(cases, message, status, run_id) {
    if (cases.length == 0) {
      return {};
    }
    const params = {result_set_data: {run_id: run_id, name: []}, result_data: {message: message, status: status.name}};
    for (const this_case of cases) {
      params.result_set_data.name.push(this_case.name);
    }
    const res = await this.httpService.postData('/result_new', params);
    return this.reformat_response(res);
  }

  //#endregion

  //#region Result
  async generate_invite() {
    const response = await this.httpService.postData('/create_invite_token', {});
    return new Invite(response['invite_data']);
  }

  async get_invite() {
    let invite = null;
    const data = await this.httpService.postData('/get_invite_token', {});
    if (data['invite_data']) {
      invite = new Invite(data['invite_data']);
    }
    return invite;
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
  async get_user_setting() {
    const response = await this.httpService.postData('/user_setting', {});
    this._timeZone = response['timezone'];
    return response;
  }

  async timezoneOffset(): Promise<string> {
    if (!this._timeZone) {
      await this.get_user_setting();
    }
    const offset = this._timeZone.match(new RegExp('([-+]).*'));
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
