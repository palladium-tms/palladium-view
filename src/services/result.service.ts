import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ResultService {
  private subject = new Subject<any>();

  update_results() {
    this.subject.next();
  }
  news(): Observable<any> {
    return this.subject.asObservable();
  }
}
