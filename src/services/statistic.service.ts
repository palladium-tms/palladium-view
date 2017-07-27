import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
@Injectable()
export class StatusticService {
  _statusic: Observable<any>;

  get statusic(): Observable<any> {
    return this._statusic;
  }
  set statusic(value: Observable<any>) {
    this._statusic = value;
  }
  constructor() {}
}
