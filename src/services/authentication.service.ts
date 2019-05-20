import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import {environment} from '../environments/environment';
import {Subject} from 'rxjs';

@Injectable()
export class AuthenticationService {
  token: string;
  isAuthorized = new Subject<boolean>();
  isAuthorized$ = this.isAuthorized.asObservable();

  constructor(private http: HttpClient) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username: string, password: string) {
    const myHeaders = {headers: new HttpHeaders().set('Content-Type', 'application/json')};
    const path = environment.host + '/public/login';
    return this.http.post(path, {'user_data': {'email': username, 'password': password}}, myHeaders).toPromise().then((response: JSON) => {
      localStorage.setItem('auth_data', JSON.stringify({username, token: response['token']}));
      this.isAuthorized.next(true);
    });
  }

  registration(username: string, password: string, invite: string) {
    const headers = {'Content-Type': 'application/json'};
    const params = JSON.stringify({'user_data': {'email': username, 'password': password, 'invite': invite}});
    const options = {headers};
    return this.http.post(environment.host + '/public/registration', params, options).toPromise();
  }

  get_no_user_status() {
    const headers = {'Content-Type': 'application/json'};
    const options = {headers};
    return this.http.post(environment.host + '/public/no_users', {}, options).toPromise().then((response: JSON) => {
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
    this.isAuthorized.next(false);
  }

  saved_token() {
    return (localStorage.getItem('auth_data'));
  }
}
