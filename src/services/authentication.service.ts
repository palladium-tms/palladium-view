import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import {environment} from '../environments/environment';

@Injectable()
export class AuthenticationService {
  public token: string;

  constructor(private http: HttpClient) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username: string, password: string) {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
    const options = { headers: headers };
    const params = new HttpParams()
      .set(`user_data[email]`, username)
      .set(`user_data[password]`, password);
      return this.http.post('/public/login', params, options).toPromise().then((response: JSON) => {
      localStorage.setItem('auth_data', JSON.stringify({ username: username, token: response['token'] }));
      return Promise.resolve(true);
    }, response => {
      console.log(response);
      return Promise.reject(false);
    });
  };

  registration(username: string, password: string, invite: string): Promise<any>  {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
    const params = new HttpParams()
      .set(`user_data[email]`, username)
      .set(`user_data[password]`, password)
      .set(`user_data[invite]`, invite);
    const options = { headers: headers };
    return this.http.post('/public/registration', params, options).toPromise()
      .then(result => {
        return Promise.resolve(result);
      }, (error: any) => {
        return Promise.reject({status: false, message: error._body});
      });
  }

  get_no_user_status() {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
    const options = { headers: headers };
    return this.http.post('/public/no_users', {}, options).toPromise().then((response: JSON) => {
      return Promise.resolve(response);
    }, response => {
      console.log(response);
      return Promise.reject(response);
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
