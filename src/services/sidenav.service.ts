import {Injectable} from '@angular/core';
import {ReplaySubject, Subject} from 'rxjs';
import {Product} from "../app/models/product";

@Injectable({
  providedIn: 'root',
})

export class SidenavService {
  private close_product_subject = new Subject<any>();
  close_product_subject$ = this.close_product_subject.asObservable();
  selectedProduct$: ReplaySubject<Product> = new ReplaySubject(1);

  toggle_product_list(): void {
    this.close_product_subject.next();
  }

  select_product(product: Product): void {
    this.selectedProduct$.next(product);
  }

  clear_product_name(): void {
    this.selectedProduct$.next({created_at: 0, updated_at: 0, id: 0, name: ''});
  }
}
