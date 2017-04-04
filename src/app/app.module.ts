import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { TopToolbarComponent } from './top-toolbar/top-toolbar.component';
import { NotFoundComponent } from './base-components/not-found.component';
import { ProductsComponent } from './products/products.component';
import { HttpModule } from '@angular/http';

const appRoutes: Routes = [
{ path: '', component: ProductsComponent },
{ path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    TopToolbarComponent,
    ProductsComponent,
    NotFoundComponent
  ],
  imports: [BrowserModule, HttpModule, RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [TopToolbarComponent]
})
export class AppModule { }
