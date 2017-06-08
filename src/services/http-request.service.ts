import {Injectable} from '@angular/core';
import {AppSettings} from '../appSettings';
import {Headers, Http, Response, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()

export class HttpService {

  constructor(private http: Http) {}

  getData(path) {
    // console.log(JSON.parse(localStorage.getItem('auth_data'))['token']);
    const headers = new Headers({'Authorization': JSON.parse(localStorage.getItem('auth_data'))['token']});
    return this.http.get(AppSettings.API_ENDPOINT + path, {headers: headers})
      .map(this.extractData)
      .catch(this.handleError);
  }

  postData(path, params) {
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Authorization': JSON.parse(localStorage.getItem('auth_data'))['token']
    });
    const options = new RequestOptions({headers: headers});
    return this.http.post(AppSettings.API_ENDPOINT + path, params, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    const body = JSON.parse(res['_body']);
    return body || {};
  }

  private handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
