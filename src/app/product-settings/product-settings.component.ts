import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Validators} from '@angular/forms';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {Router} from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-settings',
  templateUrl: './product-settings.component.html',
  styleUrls: ['./product-settings.component.css']
})
export class ProductSettingsComponent implements OnInit {
  @Input() products;
  product_form = new FormGroup({
    name: new FormControl('',  [Validators.required])
  });

  @Output() update_products = new EventEmitter();
  @ViewChild('Modal') Modal;
  item = null;
  errors = {};
  constructor(private ApiService: PalladiumApiService, private router: Router) { }

  ngOnInit(): void { }

  get name() { return this.product_form.get('name'); }

  open_modal() {
    this.Modal.open();
    this.item = this.products.filter(product => product.id === +/product\/(\d+)/.exec(this.router.url)[1])[0];
    this.product_form.patchValue({name: this.item.name});
  }

  async edit_product() {
    if (!this.name_not_changed()) {
      this.item = await this.ApiService.edit_product(this.item.id, this.name.value);
      this.products[this.products.findIndex(x => x.id === this.item.id)] = this.item;
    }
    this.close_modal();
    this.update_products.emit(this.products);
  }

  name_is_existed() {
    if (this.item) {
      if (this.name_not_changed()) { return false }
      return this.products.some(product => product.name == this.name.value);
    }
  }

  name_not_changed() {
    return this.item.name == this.name.value;
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.product_form.controls['name'].setErrors({'incorrect': true});
    }
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
