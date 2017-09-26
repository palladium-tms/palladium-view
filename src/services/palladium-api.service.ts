import {Injectable} from '@angular/core';
import {HttpService} from './http-request.service';
import {AuthenticationService} from './authentication.service';
import {Router} from '@angular/router';
import {Suite} from '../app/models/suite';
import {Run} from '../app/models/run';
import {Plan} from '../app/models/plan';
import {Case} from '../app/models/case';

@Injectable()
export class PalladiumApiService {
  suites: Suite[] = [];
  plans: Plan[] = [];
  runs: Run[] = [];
  cases: Case[] = [];

  constructor(private router: Router, private httpService: HttpService,
              private authenticationService: AuthenticationService) {
  }

  //#region Status
  get_statuses(): Promise<JSON> {
    return this.httpService.postData('/statuses', '').then((resp: any) => {
      return resp['statuses'];
    });
  }

  get_not_blocked_statuses(): Promise<JSON> {
    return this.httpService.postData('/not_blocked_statuses', '').then((resp: any) => {
      return resp['statuses'];
    });
  }

  block_status(id): Promise<JSON> {
    return this.httpService.postData('/status_edit', 'status_data[id]=' + id + '&status_data[block]=true'
    ).then((resp: any) => {
      return resp;
    });
  }

  color_status(id, color): Promise<JSON> {
    return this.httpService.postData('/status_edit', 'status_data[id]=' + id + '&status_data[color]=' + color
    ).then((resp: any) => {
      return resp;
    });
  }
  //#endregion

  //#region Token
  get_tokens(): Promise<JSON> {
    return this.httpService.postData('/tokens', '').then((resp: any) => {
      return resp['tokens'];
    }, (errors: any) => {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    });
  }
  create_token(name: string): Promise<JSON> {
    return this.httpService.postData('/token_new', 'token_data[name]=' + name).then((resp: any) => {
      return resp;
    });
  }
  //#endregion

  //#region Suite
  get_suites(product_id): Promise<Suite[]> {
    return this.httpService.postData('/suites', 'suite_data[product_id]=' + product_id).then((resp: any) => {
      this.suites = [];
      Object(resp['suites']).forEach(suite => {
        this.suites.push(new Suite(suite));
      });
      return this.suites;
    }, (errors: any) => {
    });
  }
  //#endregion
  //#region Cases
  get_cases(id): Promise<Case[]> {
    return this.httpService.postData('/cases', 'case_data[suite_id]=' + id).then((resp: any) => {
      this.cases = [];
      Object(resp['cases']).forEach(current_case => {
        this.cases.push(new Case(current_case));
      });
      return this.cases;
    }, (errors: any) => {
    });
  }
  //#endregion

  //#region Run
  get_runs(plan_id): Promise<Run[]> {
    this.runs = [];
    return this.httpService.postData('/runs', 'run_data[plan_id]=' + plan_id)
      .then(
        (resp: any) => {
          Object(resp['runs']).forEach(run => {
            this.runs.push(new Run(run));
          });
          return this.runs;
        }, (errors: any) => {
          console.log(errors);
        });
  }
  //#endregion

  //#region Plans
  get_plans(product_id): Promise<Plan[]> {
    this.plans = [];
    return this.httpService.postData('/plans', 'plan_data[product_id]=' + product_id)
      .then(
        (resp: any) => {
          Object(resp['plans']).forEach(plan => {
            this.plans.push(new Plan(plan));
          });
          return this.plans;
        }, (errors: any) => {
          console.log(errors);
        });
  }
  //#endregion
}
