import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Product} from '../models/product';

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
  @ViewChild('Modal') Modal;
  @ViewChild('form') form;

  constructor(private ApiService: PalladiumApiService, private router: Router) {}

  ngOnInit() {
    this.get_products();
  }

  get_products() {
    this.products = [];
    this.loading = true;
    this.ApiService.get_products().then(products => {
      this.products = products;
      this.loading = false;
    });
  }

  delete_product(product_id) {
    if (confirm('A u shuare?')) {
      this.ApiService.delete_product(product_id).then(products => {
        this.products = this.products.filter(prod => prod.id !== product_id);
        if (this.router.url.indexOf('/product/' + products['product']) >= 0) {
          this.router.navigate(['/']);
        }
      });
    }
  }

  delete_selected_product() {
    this.delete_product( +/product\/(\d+)/.exec(this.router.url)[1]);
  }

  edit_product_modal(form: NgForm, modal, valid: boolean) {
    if (!valid) {return; }
    this.edit_product(this.product.id, form.value['product_name']);
    modal.close();
  }

  edit_product(id, name) {
    this.ApiService.edit_product(id, name).then((product: Product) => {
      this.products[this.products.indexOf(this.products.filter(it => it.id === product.id)[0])] = product;
    });
  }
  open_modal() {
    this.product = this.products.filter(prod => prod.id === +/product\/(\d+)/.exec(this.router.url)[1])[0];
    this.form.controls['product_name'].setValue(this.product.name);
    this.Modal.open();
  };
  toolbar_opened() {
    return this.router.url.indexOf('product') >= 0;
  }
}
