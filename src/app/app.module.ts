import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TopToolbarComponent} from './top-toolbar/top-toolbar.component';
import {NotFoundComponent} from './base-components/not-found.component';
import {ProductsComponent} from './products/products.component';
import {HttpModule} from '@angular/http';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from './_guards/auth.guard';
import {AuthenticationService} from '../servises/authentication.service';
import {FormsModule} from '@angular/forms';
import {MainComponent} from './main/main.component';

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: '', component: ProductsComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: ''}
];

@NgModule({
  declarations: [
    MainComponent,
    TopToolbarComponent,
    ProductsComponent,
    NotFoundComponent,
    LoginComponent
  ],
  imports: [BrowserModule, HttpModule, RouterModule.forRoot(appRoutes), FormsModule],
  providers: [AuthGuard, AuthenticationService],
  bootstrap: [MainComponent]
})
export class AppModule {
}
