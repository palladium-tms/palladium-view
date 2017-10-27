import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Product} from '../models/product';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
declare var $: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [PalladiumApiService]
})

export class ProductsComponent implements OnInit {
  products: Product[] = [];
  product;
  @ViewChild('Modal') Modal;
  @ViewChild('form') form;
  menuItems = [
    {label: '<span class="menu-icon">Refresh</span>', onClick: this.get_products.bind(this)},
    {label: '<span class="menu-icon">Edit</span>', onClick: this.open_modal.bind(this)},
    {label: '<span class="menu-icon">Delete</span>', onClick: this.delete_product.bind(this)}];

  constructor(private ApiService: PalladiumApiService, private router: Router) {
  }

  ngOnInit() {
    this.get_products();
  }

  get_products() {
    this.products = [];
    this.ApiService.get_products().then(products => {
      this.products =  products;
    });
  }

  delete_product(product) {
    if (confirm('A u shuare?')) {
      this.ApiService.delete_product(product.dataContext.id).then(products => {
        this.products = this.products.filter(prod => prod.id !== product.dataContext.id);
        if (this.router.url.indexOf('/product/' + products['product']) >= 0) {
          this.router.navigate(['/']);
        }
      });
    }
  }

  edit_product_modal(form: NgForm, modal, valid: boolean) {
    if (!valid) {return; }
    this.edit_product(this.product.id, form.value['product_name']);
    modal.close();
  }

  edit_product(id, name) {
    this.ApiService.edit_product(id, name).then(product => {
      this.products.forEach(current_product => {
        if (current_product.id === product.id) {
          current_product.name = product.name;
          current_product.updated_at = product.updated_at;
        }
      }); // FIXME: need optimize
    });
  }
  open_modal(product) {
    this.product = this.products.filter(prod => prod.id === product.dataContext.id)[0];
    this.form.controls['product_name'].setValue(this.product.name);
    this.Modal.open();
  };
}
