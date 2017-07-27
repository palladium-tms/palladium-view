import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {AppSettings} from './settings.service';
import 'rxjs/add/observable/of';

@Injectable()
export class AuthenticationService {
  apiurl;
  public token: string;

  constructor(private http: Http,
              private settings: AppSettings) {
    // set token if saved in local storage
    this.settings.api_url().toPromise().then(data => {this.apiurl = data; });
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username: string, password: string) {
    // console.log('----------------');
    // console.log(username);
    // console.log(password);
    // console.log(JSON.stringify({ username: username, password: password }));
    // console.log('----------------');
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    // headers.append('Authorization', 'Bearer');
    const options = new RequestOptions({ headers: headers });
      return this.http.post(this.apiurl + '/login',
        'user_data[email]=' + username + '&user_data[password]=' + password, options)
        .map((response: Response) => {
          // login successful if there's a jwt token in the response
          console.log(response.json().token);
          const token = response.json() && response.json().token;
          // set token property
          this.token = token;
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('auth_data', JSON.stringify({ username: username, token: token }));
          return true;
        }).catch((error: any) => {
        if (error.status === 401) {
          return Observable.of(false);
        }
        // do any other checking for statuses here
      });
  };

  registration(username: string, password: string): Observable<boolean>  {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    // headers.append('Authorization', 'Bearer');
    const options = new RequestOptions({ headers: headers });
    return this.http.post(this.apiurl + '/registration',
      'user_data[email]=' + username + '&user_data[password]=' + password, options)
      .map((response: Response) => {
        return true;
      }).catch((error: any) => {
        if (error.status === 401) {
          return Observable.of(false);
        }
      });
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('auth_data');
  }

  saved_token() {
    return(localStorage.getItem('auth_data'));
  }
}
