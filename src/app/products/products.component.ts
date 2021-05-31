import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {SidenavService} from '../../services/sidenav.service';
import {StanceService} from '../../services/stance.service';
import {AuthenticationService} from '../../services/authentication.service';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import { Product } from 'app/models/product';
import { validateNameExists } from 'app/validates_and_matchers/name-exist.validate';
import { InstantErrorStateMatcher } from 'app/validates_and_matchers/instant-error-state.matcher';

@Component({
  selector: 'app-products',
  templateUrl: 'products.component.html',
  styleUrls: ['products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProductsComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
  products;
  authorize;
  pinned = true;
  loading = false;
  dashboard_status: boolean = true;
  private unsubscribe: Subject<void> = new Subject();


  constructor(public palladiumApiService: PalladiumApiService,
              private stance: StanceService,
              private activatedRoute: ActivatedRoute,
              public router: Router, private dialog: MatDialog,
              public sidenavService: SidenavService,
              private cd: ChangeDetectorRef,
              private authenticationService: AuthenticationService) {
    authenticationService.isAuthorized$.subscribe( status => {
      this.authorize = status;
    });
  }

  ngOnInit() {
    this.palladiumApiService.get_statuses();
    this.palladiumApiService.get_user_setting();
    this.palladiumApiService.get_products();
    this.authorize = (localStorage.getItem('auth_data') !== null);
    this.authenticationService.isAuthorized.next(this.authorize);
    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.cd.detectChanges();
    });
    this.palladiumApiService.products$.pipe(takeUntil(this.unsubscribe)).subscribe(products => {
      this.products = products;
      if (this.stance.productId()) {
        const product = this.products.find(product => product.id === this.stance.productId());
        if (product) {
          this.sidenavService.selectedProductName$.next(product.name);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.sidenavService.selectedProductName$.next('');
      }
      this.cd.detectChanges();
    });

    this.sidenavService.toggleProductSubject$.subscribe(() => {
      this.sidenav.toggle();
    });
  }

  open_settings() {
    this.dialog.open(ProductSettingsComponent, {
      data: {
        products: this.products,
      }
    });
  }

  get_products() {
    this.loading = true;
    this.palladiumApiService.get_products_obs().subscribe(() => {
    this.loading = false;
    this.cd.detectChanges();
    })
  }

  dashboard_activate(status: boolean): void {
    this.dashboard_status = status;
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
    this.send_products_position();
  }

  select_product(product) {
    this.sidenav.close();
    this.sidenavService.selectedProductName$.next(product.name);
    this.router.navigate(['/product', product.id]);
  }

  open_create_product() {
    const dialogRef = this.dialog.open(ProductsCreateComponent, {
      data: {
        products: this.products
      }
    });
  }

  ngOnDestroy() {
    this.cd.detach();
    this.unsubscribe.next();
    this.unsubscribe.complete();
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
              @Inject(MAT_DIALOG_DATA) public data, private cd: ChangeDetectorRef) {
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

  edit_product() {
    if (!this.formGroup.untouched) {
      this.palladiumApiService.edit_product(this.item.id, this.name.value);
    }
    this.dialogRef.close(this.products);
  }

  delete_item() {
    if (confirm('A u shuare?')) {
      this.palladiumApiService.delete_product(this.item.id);
      this.router.navigate(['/']);
      this.dialogRef.close(this.products);
    }
  }

  ngOnDestroy() {
    this.cd.detach();
  }
}


export interface ProductCreationResponceInterface {
  product: Product,
  request_status?: string
}

@Component({
  selector: 'app-products-create',
  templateUrl: 'products-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCreateComponent implements OnInit {
  nameFormControl: FormControl;
  error_message: any;
  newerrorStateMatcher = new InstantErrorStateMatcher();
  product_creating_status: { waiting: boolean, existed_product?: Product, error_message?: string };

  products: Product[] = [];

  constructor(public dialogRef: MatDialogRef<ProductSettingsComponent>,
    private palladiumApiService: PalladiumApiService, private router: Router,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit(): void {
    this.product_creating_status = { waiting: false };
    this.error_message = '';
    this.nameFormControl = new FormControl(null, [Validators.required, validateNameExists(this.data.products)]);

  }

  create() {
    this.product_creating_status.waiting = true;
    this.palladiumApiService.create_product(this.nameFormControl.value).pipe(
      map((plan_creating_responce: ProductCreationResponceInterface) => {
        if (plan_creating_responce.request_status) {
          this.product_creating_status = {
            waiting: false,
            error_message: plan_creating_responce.request_status,
          };
          this.nameFormControl.setErrors({'validateNameExists': true})
          this.cd.detectChanges();
        } else {
          this.dialogRef.close();
        }
      })).subscribe()
  }

  getErrorMessage() {
    if (this.nameFormControl.hasError('required')) {
      return 'You must enter a value';
    }

    if (this.nameFormControl.hasError('validateNameExists')) {
      this.product_creating_status['existed_product'] = this.products.find(product => product.name == this.nameFormControl.value)
      return 'Product with this name is exist';
    }
  }
}
