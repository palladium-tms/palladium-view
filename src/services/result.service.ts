import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ResultService {
  private subject = new Subject<any>();

  update_results(res) {
    this.subject.next(res);
  }
  news() {
    return this.subject.asObservable();
  }
}
