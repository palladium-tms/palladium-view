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
  // endregion
}
