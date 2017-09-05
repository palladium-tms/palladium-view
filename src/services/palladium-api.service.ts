import { Injectable } from '@angular/core';
import { HttpService } from './http-request.service';
import {AuthenticationService} from './authentication.service';
import { Router } from '@angular/router';

@Injectable()
export class PalladiumApiService {
  constructor(  private router: Router, private httpService: HttpService, private authenticationService: AuthenticationService ) { }
  // Status reqion
  get_statuses(): Promise<JSON> {
    return this.httpService.postData('/statuses', '').then((resp: any) => {
      return resp['statuses'];
    });
  }
  get_not_blocked_statuses(): Promise<JSON> {
    return this.httpService.postData('/not_blocked_statuses', '').then((resp: any) => {
      return resp['statuses'];
    });
  }
  block_status(id): Promise<JSON> {
    return this.httpService.postData('/status_edit', 'status_data[id]=' + id + '&status_data[block]=true'
    ).then((resp: any) => {
      return resp;
    });
  }
  color_status(id, color): Promise<JSON> {
    return this.httpService.postData('/status_edit', 'status_data[id]=' + id + '&status_data[color]=' + color
    ).then((resp: any) => {
      return resp;
    });
  }
  // Token region
  get_tokens(): Promise<JSON> {
    return this.httpService.postData('/tokens', '').then((resp: any) => {
      return resp['tokens'];
    }, (errors: any) => {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    });
  }
  // endregion
  create_token(name: string): Promise<JSON> {
    return this.httpService.postData('/token_new', 'token_data[name]=' + name).then((resp: any) => {
      return resp;
    });
  }
  // endregion
}
