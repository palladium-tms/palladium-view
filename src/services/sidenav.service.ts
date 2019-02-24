import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class SidenavService {
  private close_product_subject = new Subject<any>();
  private get_product_subject = new Subject<String>();
  close_product_subject$ = this.close_product_subject.asObservable();
  get_product_subject$ = this.get_product_subject.asObservable();

  close_product_list() {
    this.close_product_subject.next(Object);
  }

  set_product_name(product_name) {
    this.get_product_subject.next(product_name);
  }
}
