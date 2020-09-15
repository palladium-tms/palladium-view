import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../environments/environment';
import {AuthenticationService} from 'services/authentication.service';
import 'rxjs/add/operator/catch'; // don't forget this, or you'll get a runtime error
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {delay} from "rxjs/internal/operators";

@Injectable()

export class HttpService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

  /*endpoint for api server can be like http://192.168.0.1, without last slash.
   * if request is used api (need token) - part /api/ will be added to url */
  postData(path, params) {
    const reqHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization',  JSON.parse(localStorage.getItem('auth_data'))['token'] );
    // return this.http.post(environment.host + '/api' + path, JSON.stringify(params), {headers: headers}).toPromise().then((result: PalladiumResponseInterface ) => {
    //     if (error.status === 401 ) {
    //       console.error(error.message);
    //       this.authenticationService.logout();
    //     }
    // });

    return this.http.post(environment.host + '/api' + path, JSON.stringify(params), {headers: reqHeaders}).pipe(catchError(this.handleError));
  }

  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
