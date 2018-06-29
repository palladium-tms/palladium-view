import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {environment} from '../environments/environment';

@Injectable()

export class HttpService {

  constructor(private http: HttpClient) {}

  /*endpoint for api server can be like http://192.168.0.1, without last slash.
   * if request is used api (need token) - part /api/ will be added to url */
  postData(path, params) {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization',  JSON.parse(localStorage.getItem('auth_data'))['token'] );
    const options = {headers: headers};
    return this.http.post(environment.host + '/api' + path, JSON.stringify(params), options).toPromise().then((param: any) => {
      return Promise.resolve(this.extractData(param));
    }, param => {
      return Promise.reject(this.handleError(param));
    });
  }

  private extractData(res: any) {
    return res || {};
  }

  private handleError(error:  any) {
    // TODO: add remote logging
    let errMsg: string;
       console.log(error);
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
