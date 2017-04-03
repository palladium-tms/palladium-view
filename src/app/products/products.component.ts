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
    this.httpService.getData('/products')
      .subscribe(
        products => {
          this.products = products['products'];
        },
        error =>  this.errorMessage = <any>error);
  }
}
