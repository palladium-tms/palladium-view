import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import {environment} from '../environments/environment';

@Injectable()
export class AuthenticationService {
  public token: string;

  constructor(private http: Http) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username: string, password: string) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    const options = new RequestOptions({ headers: headers });

      return this.http.post(environment.host + '/login',
        'user_data[email]=' + username + '&user_data[password]=' + password, options).toPromise().then(response => {
      console.log(response.json().token);
      const token = response.json() && response.json().token;
      this.token = token;
      localStorage.setItem('auth_data', JSON.stringify({ username: username, token: token }));
      return Promise.resolve(true);
    }, response => {
      console.log(response);
      return Promise.reject(false);
    });
  };

  registration(username: string, password: string): Promise<any>  {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    // headers.append('Authorization', 'Bearer');
    console.log(environment.host + '/registration');
    const options = new RequestOptions({ headers: headers });
    return this.http.post(environment.host + '/registration',
      'user_data[email]=' + username + '&user_data[password]=' + password, options).toPromise()
      .then(result => {
        return Promise.resolve({message: ''});
      }, (error: any) => {
        return Promise.reject({status: false, message: error._body});
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
