import {Injectable} from '@angular/core';
import {ReplaySubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class SidenavService {
  selectedProductName$: ReplaySubject<string> = new ReplaySubject(0);
  private toggleProductSubject = new Subject();
  toggleProductSubject$ = this.toggleProductSubject.asObservable();

  toggle_product_list(): void {
    this.toggleProductSubject.next();
  }
}
