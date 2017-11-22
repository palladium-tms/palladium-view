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
  product;

  constructor(private ApiService: PalladiumApiService, private router: Router) {}

  ngOnInit() {
    this.get_products();
  }

  get_products() {
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
  setting_is_visible() {
    return (/product\/(\d+)/.exec(this.router.url) === null);
  }
}
