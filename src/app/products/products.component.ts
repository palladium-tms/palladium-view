import { Component, OnInit } from '@angular/core';
import {PalladiumApiService} from '../../servises/palladium-api.service';
import {Product} from '../models/product';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  providers: [PalladiumApiService]
})

export class ProductsComponent implements OnInit {
  products: Product[] = [];
  errorMessage;
  constructor(private httpService: PalladiumApiService) {}

  ngOnInit() {
    this.get_products();
  }

  get_products() {
    this.httpService.getData('/api/products')
      .subscribe(
        products => {
          this.products = products['products'];
        },
        error =>  this.errorMessage = <any>error);
  }

  delete_product(product_id) {
    this.httpService.postData('/api/product_delete', 'product_data[id]=' + product_id)
      .subscribe(
        products => {
          this.get_products();
        },
        error =>  this.errorMessage = <any>error);
  }
}
