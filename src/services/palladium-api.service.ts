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

@Injectable()
export class PalladiumApiService {
  suites: Suite[] = [];
  plans: Plan[] = [];
  response_plan_data = {};
  response_suite_data = {};
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
  get_statuses(): Promise<any> {
    return this.httpService.postData('/statuses', '').then((resp: any) => {
      const statuses = [];
      Object.keys(resp['statuses']).forEach(key => {
        statuses.push(new Status(resp['statuses'][key]));
      });
      statuses.push(new Status({name: 'Untested', color: 'white', id: 0, 'blocked': true}));
      return statuses;
    });
  }

  get_not_blocked_statuses(): Promise<any> {
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

  update_status(id, name, color): Promise<any> {
    return this.httpService.postData('/status_edit', {
      status_data: {
        id: id,
        name: name,
        color: color
      }
    }).then((resp: any) => {
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
  get_suites(product_id): Promise<any> {
    return this.httpService.postData('/suites', {suite_data: {product_id: product_id}}).then((resp: any) => {
      this.response_suite_data[product_id] = [];
      Object(resp['suites']).forEach(suite => {
        this.response_suite_data[product_id].push(new Suite(suite));
      });
      return this.response_suite_data;
    }, (errors: any) => {
      console.log(errors);
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

  async delete_case(case_id) {
    const resp = await this.httpService.postData('/case_delete', {case_data: {id: case_id}});
    return new Case(resp['case']);
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
    return await this.httpService.postData('/run_delete', {run_data: {id: run_id}})['run']
  }

  //#endregion

  //#region Products
  products = async () => {
    const product_pack = await this.httpService.postData('/products', '');
    return product_pack['products'].map(product => new Product(product));
  };

  async delete_product(id) {
    return await this.httpService.postData('/product_delete', {product_data: {id: id}})
  }

  async edit_product(id, name) {
    try {
      const product = await this.httpService.postData('/product_edit', {product_data: {name: name, id: id}});
      return new Product(product['product']);
    } catch (error) {
      console.log(error)
    }
  }

  //#endregion

  //#region Products
  send_product_position(product_ids_array) {
    return this.httpService.postData('/set_product_position', {product_position: product_ids_array})
  }

  //#endregion

  //#region Plans
  async get_plans(product_id) {
    try {
      const response = await this.httpService.postData('/plans', {plan_data: {product_id: product_id}});
      this.response_plan_data[product_id] = [];
      Object(response['plans']).forEach(plan => {
        this.response_plan_data[product_id].push(new Plan(plan));
      });
      return this.response_plan_data;
    } catch (errors) {
      console.log(errors);
    }
  }

  edit_plan(id, name): Promise<any> {
    return this.httpService.postData('/plan_edit', {plan_data: {plan_name: name, id: id}})
      .then((resp: any) => {
        if (resp['errors']) {
          return Promise.reject(resp['errors']);
        } else {
          return Promise.resolve(new Plan(resp['plan']));
        }
      });
  }

  async delete_plan(id) {
    return await this.httpService.postData('/plan_delete', {plan_data: {id: id}})['plan']
  }

  //#endregion

  //#region Result Set
  get_result_sets(run_id): Promise<any> {
    return this.httpService.postData('/result_sets', {result_set_data: {run_id: run_id}})
      .then(
        resp => {
          this.result_sets = [];
          Object(resp['result_sets']).forEach(result_set => {
            this.result_sets.push(new ResultSet(result_set));
          });
          return this.result_sets;
        }, (errors: any) => {
          console.log(errors);
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
    if (result_sets.length == 0) { return {} }
    const res = await this.httpService.postData('/result_new', {
      result_data: {
        message: description, status: status.name,
        result_set_id: result_sets.map(obj => obj.id)
      }
    });
    return this.reformat_response(res);
  }

  async result_new_by_case(cases, message, status, run_id) {
    if (cases.length == 0) { return {} }
    const params = {result_set_data: {run_id: run_id, name: []}, result_data: {message: message, status: status.name}};
    for (const this_case of cases) {
      params.result_set_data.name.push(this_case.name);
    }
    const res = await this.httpService.postData('/result_new', params);
    return this.reformat_response(res)
  }

  //#endregion

  //#region Result
  async generate_invite() {
    const response = await this.httpService.postData('/create_invite_token', {});
    return new Invite(response['invite_data'])
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
      response['result'] = new Result(res['result'])
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

  async timezoneOffset():Promise<string>{
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
    await this.httpService.postData('/user_setting_edit', {'user_settings':{'timezone': timezone}});
  }
  //#endregion
}
