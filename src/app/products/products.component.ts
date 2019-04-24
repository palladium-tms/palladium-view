import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSidenav} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {SidenavService} from '../../services/sidenav.service';

@Component({
  selector: 'app-products',
  templateUrl: 'products.component.html',
  styleUrls: ['products.component.css'],
  providers: [PalladiumApiService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductsComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;
  products;
  pinned = true;
  selectedProduct = {id: 0, name: ''};

  constructor(private palladiumApiService: PalladiumApiService, private activatedRoute: ActivatedRoute,
              private router: Router, private dialog: MatDialog,
              public sidenavService: SidenavService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(() => {
      this.get_products();
      this.cd.detectChanges();
    });
    this.sidenavService.close_product_subject$.subscribe(() => {
      this.sidenav.toggle();
      this.cd.detectChanges();
    });
  }

  async get_products() {
    this.products = [];
    this.products = await this.palladiumApiService.products();
    const productUrl = this.router.url.match(/product\/(\d+)/);
    if(productUrl) {
      const productId = +productUrl[1];
      this.selectedProduct.name = this.products.find(product => product.id === productId).name;
      this.sidenavService.set_product_name(this.products.find(product => product.id === productId).name);
    }
    this.cd.detectChanges();
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

  pin_list() {
    this.pinned = !this.pinned;
    this.send_products_position();
  }

  send_products_position() {
    this.palladiumApiService.send_product_position(this.products.map(elem => elem['id']));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.products, event.previousIndex, event.currentIndex);
  }

  select_product(product) {
    this.sidenavService.set_product_name(product.name);
    this.selectedProduct.id = product.id;
    this.sidenav.close();
    this.cd.detectChanges();
    this.router.navigate(['/product', product.id]);
  }

  ngOnDestroy() {
    this.cd.detach();
  }
}

@Component({
  selector: 'app-product-settings',
  templateUrl: 'product-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSettingsComponent implements OnInit, OnDestroy {
  item;
  products;
  formGroup = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
              private palladiumApiService: PalladiumApiService, private router: Router,
              @Inject(MAT_DIALOG_DATA) public data, public sidenavService: SidenavService, private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.products = this.data.products;
    this.item = this.products.filter(product => product.id === +/product\/(\d+)/.exec(this.router.url)[1])[0];
    this.formGroup.patchValue({name: this.item.name});
  }

  get name() {
    return this.formGroup.get('name');
  }

  check_existing() {
    if (this.name_is_existed()) {
      this.formGroup.controls['name'].setErrors({'is_exist': true});
    }
  }

  name_is_existed() {
    if (this.name_not_changed()) {
      return false;
    }
    return this.products.some(product => product.name === this.name.value);
  }

  name_not_changed() {
    return this.item.name === this.name.value;
  }

  async edit_product() {
    if (!this.formGroup.untouched) {
      this.item = await this.palladiumApiService.edit_product(this.item.id, this.name.value);
      this.products[this.products.findIndex(x => x.id === this.item.id)] = this.item;
    }
    this.sidenavService.set_product_name(this.name.value);
    this.dialogRef.close(this.products);
  }

  async delete_item() {
    if (confirm('A u shuare?')) {
      await this.palladiumApiService.delete_product(this.item.id);
      this.products = this.products.filter(prod => prod.id !== this.item.id);
      this.router.navigate(['/']);
      this.dialogRef.close(this.products);
    }
  }

  ngOnDestroy() {
    this.cd.detach();
  }
}
