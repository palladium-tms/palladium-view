import { Injectable } from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StanceService {
  constructor(private router: Router) { }

  productId():number {
    const productUrl = this.router.url.match(/product\/(\d+)/);
      if (productUrl) {
        return +productUrl[1];
      }
  }

  planId():number {
    const planUrl = this.router.url.match(/plan\/(\d+)/i);
      if (planUrl) {
        return +planUrl[1];
      }
  }

  runId():number {
    const planUrl = this.router.url.match(/run\/(\d+)/i);
      if (planUrl) {
        return +planUrl[1];
      }
  }

  suiteId():number {
    const planUrl = this.router.url.match(/suite\/(\d+)/i);
      if (planUrl) {
        return +planUrl[1];
      }
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
