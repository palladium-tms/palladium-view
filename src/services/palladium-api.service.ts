import { Injectable } from '@angular/core';
import { HttpService } from './http-request.service';
@Injectable()
export class PalladiumApiService {
  constructor( private httpService: HttpService) { }
  // Status reqion
  get_statuses(): Promise<JSON> {
    return this.httpService.postData('/statuses', '').then((resp: Response) => {
      return resp['statuses'];
    });
  }
  get_not_blocked_statuses(): Promise<JSON> {
    return this.httpService.postData('/not_blocked_statuses', '').then((resp: Response) => {
      return resp['statuses'];
    });
  }
  block_status(id): Promise<JSON> {
    return this.httpService.postData('/status_edit', 'status_data[id]=' + id + '&status_data[block]=true'
      ).then((resp: Response) => {
      return resp;
    });
  }
  color_status(id, color): Promise<JSON> {
    return this.httpService.postData('/status_edit', 'status_data[id]=' + id + '&status_data[color]=' + color
      ).then((resp: Response) => {
      return resp;
    });
  }
  // Token region
  get_tokens(): Promise<JSON> {
    return this.httpService.postData('/tokens', '').then((resp: Response) => {
      return resp['tokens'];
    });
  }

  // endregion
  create_token(name: string): Promise<JSON> {
    return this.httpService.postData('/token_new', 'token_data[name]=' + name).then((resp: Response) => {
      return resp;
    });
  }
  // endregion
}
