import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { TopToolbarComponent } from './top-toolbar/top-toolbar.component';
import { ProductsComponent } from './products/products.component';

@NgModule({
  declarations: [
    TopToolbarComponent,
    ProductsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [TopToolbarComponent, ProductsComponent]
})
export class AppModule { }
