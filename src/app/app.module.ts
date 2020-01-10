import '../polyfills';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {AuthGuard} from './_guards/auth.guard';
import {AuthenticationService} from '../services/authentication.service';
import {PalladiumApiService} from '../services/palladium-api.service';
import {HttpService} from '../services/http-request.service';
import {MainComponent} from './main/main.component';
import {DetailResultComponent} from './detail-result/detail-result.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from '@angular/material';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

const appRoutes: Routes = [
  {path: 'singin', loadChildren: () => import('./login/login.module').then(m => m.LoginModule)},
  {path: 'registration', loadChildren: () => import('./registration/registration.module').then(m => m.RegistrationModule)},
  {
    path: '', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule), canActivate: [AuthGuard]
  },
  {path: 'result/:id', component: DetailResultComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: '/404'},
];

@NgModule({
  declarations: [
    MainComponent,
    DetailResultComponent,
  ],
  imports: [LoggerModule.forRoot({level: NgxLoggerLevel.OFF}),
    BrowserModule, HttpClientModule, RouterModule.forRoot(appRoutes),  BrowserAnimationsModule],
  providers: [AuthGuard, AuthenticationService, PalladiumApiService, HttpService,
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}],
  bootstrap: [MainComponent],
})
export class AppModule {
}
