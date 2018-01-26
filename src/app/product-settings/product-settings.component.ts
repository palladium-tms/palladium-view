import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Product} from '../models/product';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-product-settings',
  templateUrl: './product-settings.component.html',
  styleUrls: ['./product-settings.component.css']
})
export class ProductSettingsComponent implements OnInit {
  @Input() products;
  @Output() update_products = new EventEmitter();
  @ViewChild('product_name') product_name;
  @ViewChild('Modal') Modal;
  @ViewChild('form') form;
  item = null;
  constructor(private ApiService: PalladiumApiService, private router: Router) { }

  ngOnInit() { }

  open_modal() {
    this.Modal.open();
    this.item = this.products.filter(product => product.id === +/product\/(\d+)/.exec(this.router.url)[1])[0];
    this.form.controls['product_name'].setValue(this.item.name);
  }

  edit_product(form: NgForm, valid: boolean) {
    if (!valid) {return; }
    this.ApiService.edit_product(this.item.id, form.value['product_name']).then((product: Product) => {
      if (product.errors) {
        console.log(product.errors);
      } else {
        this.products[this.products.indexOf(this.products.filter(it => it.id === product.id)[0])] = product;
        this.item = product;
        this.close_modal();
        this.update_products.emit(this.products);
      }
    });
  }

  log() {
    console.log('11111')
  }

  delete_item() {
    if (confirm('A u shuare?')) {
      this.ApiService.delete_product(this.item.id).then(products => {
        this.products = this.products.filter(prod => prod.id !== +products['product']);
        this.close_modal();
        this.update_products.emit(this.products);
        if (this.router.url.indexOf('/product/' + products['product']) >= 0) {
          this.router.navigate(['/']);
        }
      });
    }
  }

  close_modal() {
    this.Modal.close();
    this.item = null;
  }
}
