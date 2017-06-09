import { Injectable } from '@angular/core';
import { HttpService } from './http-request.service';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
@Injectable()
export class PalladiumApiService {
  constructor( private httpService: HttpService) { }
  // Status reqion
  get_statuses(): Observable<JSON> {
    return this.httpService.getData('/api/statuses').map((resp: Response) => {
      return resp['statuses'];
    });
  }
  // endregion

}