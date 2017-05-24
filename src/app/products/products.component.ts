import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
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
  edit_product(form: NgForm, id: number, index: number) {
    const params = 'product_data[name]=' + form.value['product_name'] + '&product_data[id]=' +  id;
    this.httpService.postData('/api/product_edit', params)
      .subscribe(
        products => {
          if (Object.keys(products.errors).length === 0) {
            this.products[index].name = products.product_data.name;
            this.products[index].updated_at = products.product_data.updated_at;
          } else {
            console.log(products.errors);
          }
        },
        error =>  this.errorMessage = <any>error);
  }
}
