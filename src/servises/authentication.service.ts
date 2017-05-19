import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {AppSettings} from '../appSettings';


@Injectable()
export class AuthenticationService {
  public token: string;

  constructor(private http: Http) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username: string, password: string): Observable<boolean> {
    console.log('----------------');
    console.log(username);
    console.log(password);
    console.log(JSON.stringify({ username: username, password: password }));
    console.log('----------------');
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
    // headers.append('Authorization', 'Bearer');
    const options = new RequestOptions({ headers: headers });

    return this.http.post(AppSettings.API_ENDPOINT + '/login',
      'user_data[email]=' + username + '&user_data[password]=' + password, options)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        console.log(response.json().token);
        const token = response.json() && response.json().token;

        if (token) {
          // set token property
          this.token = token;
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('auth_data', JSON.stringify({ username: username, token: token }));
          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          return false;
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
