import { Injectable } from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StanceService {
  constructor(private router: Router) { }

  productId():number {
    const productUrl = this.router.url.match(/product\/(\d+)/);
      if (productUrl) {
        return +productUrl[1];
      }
  }
}
