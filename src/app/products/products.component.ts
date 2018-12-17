import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Validators} from '@angular/forms';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: 'products.component.html',
  styleUrls: ['products.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [PalladiumApiService]
})

export class ProductsComponent implements OnInit {
  products;
  pinned = true;
  product;

  constructor(private ApiService: PalladiumApiService, private router: Router,  private dialog: MatDialog) {}

  ngOnInit() {
    this.get_products();
  }

  async get_products() {
    this.products = [];
    this.products = await this.ApiService.products();
  }

  open_settings() {
    const dialogRef = this.dialog.open(ProductSettingsComponent, {
      data: {
        products: this.products,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.products = result;
      }
    });
  }

  setting_is_visible() {
    return (/product\/(\d+)/.exec(this.router.url) === null);
  }

  pin_list() {
    this.pinned = !this.pinned;
    this.send_products_position();
  }

  send_products_position() {
    this.ApiService.send_product_position(this.products.map(elem => elem['id']))
  }

  removeItem(item: any, list: any[]): void {
    list.splice(list.indexOf(item), 1);
  }
}

@Component({
  selector: 'app-product-settings',
  templateUrl: 'product-settings.component.html',
})
export class ProductSettingsComponent implements OnInit {
  item;
  products;
  product_form = new FormGroup({
    name: new FormControl('',  [Validators.required])
  });
  errors = {};

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private ApiService: PalladiumApiService, private router: Router, @Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit(): void {
    this.products = this.data.products;
    this.item = this.products.filter(product => product.id === +/product\/(\d+)/.exec(this.router.url)[1])[0];
    this.product_form.patchValue({name: this.item.name});
  }

  get name() { return this.product_form.get('name'); }

  check_existing() {
    if (this.name_is_existed()) {
      this.product_form.controls['name'].setErrors({'is_exist': true});
    }
  }

  name_is_existed() {
    if (this.name_not_changed()) { return false }
    return this.products.some(product => product.name == this.name.value);
  }

  name_not_changed() {
    return this.item.name == this.name.value;
  }

  async edit_product() {
    if (!this.product_form.untouched) {
      this.item = await this.ApiService.edit_product(this.item.id, this.name.value);
      this.products[this.products.findIndex(x => x.id === this.item.id)] = this.item;
    }
    this.dialogRef.close(this.products);
  }


  async delete_item() {
    if (confirm('A u shuare?')) {
      await this.ApiService.delete_product(this.item.id);
      this.products = this.products.filter(prod => prod.id !== this.item.id);
      this.router.navigate(['/']);
      this.dialogRef.close(this.products);
    }
  }

  log(a) {
    console.log(a)
  }
}
