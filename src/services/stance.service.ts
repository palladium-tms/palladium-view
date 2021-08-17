import { Injectable } from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StanceService {
  constructor(private router: Router) { }

  productId():any {
    const url = this.router.url.match(/product\/(\d+)/);
      if (url) {
        return +url[1];
      }
  }

  planId():any {
    const url = this.router.url.match(/plan\/(\d+)/i);
      if (url) {
        return +url[1];
      }
  }

  runId():any {
    const url = this.router.url.match(/run\/(\d+)/i);
      if (url) {
        return +url[1];
      }
  }

  suiteId():any {
    const url = this.router.url.match(/suite\/(\d+)/i);
      if (url) {
        return +url[1];
      }
  }

  resultSetId():any {
    const url = this.router.url.match(/result_set\/(\d+)/i);
      if (url) {
        return +url[1];
      }
  }

  caseId():any {
    const url = this.router.url.match(/case\/(\d+)/i);
      if (url) {
        return +url[1];
      }
  }

  is_current_result_set(object):any {
    return object.path === 'result_set' && object.id === this.resultSetId();
  }

  is_current_case(object):any {
    return object.path === 'case' && object.id === this.caseId();
  }

  case_or_result_set_by_url(obj):boolean {
    return this.is_current_result_set(obj) || this.is_current_case(obj);
  }

  run_or_suite_by_url(object):boolean {
    return this.is_current_run(object) || this.is_current_suite(object);
  }

  is_current_run(object): boolean {
    return object.path === 'run' && object.id === this.runId();
  }

  is_current_suite(object): boolean {
    return object.path === 'suite' && object.id === this.suiteId();
  }
}
