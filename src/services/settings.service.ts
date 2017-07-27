import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
@Injectable()
export class AppSettings {
  constructor(private http: Http) { }
  public api_url(): Observable<any> {
    return this.http.get('/config.json')
      .map((res: any) => {
        return (JSON.parse(res._body).host);
      })
      .catch(error => {
        console.log(error);
        return Observable.throw(console.log(error));
      });
  }

}
