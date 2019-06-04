import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class SidenavService {
  private close_product_subject = new Subject<any>();
  private get_product_subject = new Subject<string>();
  close_product_subject$ = this.close_product_subject.asObservable();
  get_product_subject$ = this.get_product_subject.asObservable();

  toggle_product_list() {
    this.close_product_subject.next();
  }

  set_product_name(productName) {
    this.get_product_subject.next(productName);
  }
}
