import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [PalladiumApiService]
})

export class ProductsComponent implements OnInit {
  products;
  loading = false;
  pinned = true;
  product;

  constructor(private ApiService: PalladiumApiService, private router: Router) {}

  ngOnInit() {
    this.get_products();
  }

  get_products() {
    if (this.loading) {return}
    this.setting_is_visible();
    this.products = [];
    this.loading = true;
    this.ApiService.get_products().then(products => {
      this.products = products;
      this.loading = false;
    });
  }

  update_products(event) {
    this.products = [];
    this.products = event;
  }

  open_settings(settings) {
    if (!this.loading) {settings.open_modal()}
  }

  setting_is_visible() {
    return (/product\/(\d+)/.exec(this.router.url) === null);
  }

  pin_list() {
    this.pinned = !this.pinned;
    this.send_products_position();
  }

  send_products_position() {
    this.ApiService.send_product_position(this.products.map(elem => elem['id'])).then(response => {
      console.log('ok')
    })
  }

  public removeItem(item: any, list: any[]): void {
    list.splice(list.indexOf(item), 1);
  }
}
