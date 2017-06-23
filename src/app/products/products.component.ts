import { Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {HttpService} from '../../services/http-request.service';
import {Product} from '../models/product';
import {Router} from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  providers: [HttpService]
})

export class ProductsComponent implements OnInit {
  products: Product[] = [];
  errorMessage;
  product_settings_data = {};
  constructor(private httpService: HttpService, private router: Router) {}
  ngOnInit() {
    this.products = [];
    this.get_products();
  }
  get_products() {
    this.httpService.getData('/api/products')
      .subscribe(
        (products) => {
          this.products = products['products'];
        },
        error =>  this.errorMessage = <any>error);
  }
  delete_product(modal) {
    if (confirm('A u shuare?')) {
    this.httpService.postData('/api/product_delete', 'product_data[id]=' + this.product_settings_data['id'])
      .subscribe(
        products => {
          this.products.splice(this.product_settings_data['index'], 1);
          if ( this.router.url.indexOf('/product/' + products['product']) >= 0) {
            this.router.navigate(['/']);
          }
        },
        error =>  this.errorMessage = <any>error);
      modal.close();
    }
  }
  edit_product(form: NgForm, modal, valid: boolean) {
    if ( !valid ) { return; }
    const params = 'product_data[name]=' + form.value['product_name'] + '&product_data[id]=' +  this.product_settings_data['id'];
    this.httpService.postData('/api/product_edit', params)
      .subscribe(
        products => {
          if (Object.keys(products.errors).length === 0) {
            this.products[this.product_settings_data['index']].name = products.product_data.name;
            this.products[this.product_settings_data['index']].updated_at = products.product_data.updated_at;
          } else {
            console.log(products.errors);
          }
        },
        error =>  this.errorMessage = <any>error);
    modal.close();
  }
  show_settings_button(index) {
      $('.product-setting-button' + '#' + index).show();
  };
  hide_settings_button(index) {
    $('.product-setting-button' + '#' + index).hide();
  };
  settings(modal, product, index, form) {
    this.product_settings_data = {id: product.id, index: index};
    modal.open();
    form.controls['product_name'].setValue(product.name);
  }
  set_space_width() {
    $('.lost-result').show();
    $('.product-space').removeClass('small-column big-column').addClass('very-big-column');
    $('.plan-space').removeClass('small-column big-column').addClass('very-big-column');
  }
}
