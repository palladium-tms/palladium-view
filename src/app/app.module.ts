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
import {PlansComponent} from './plans/plans.component';
import {RunsComponent} from './runs/runs.component';
import {ResultSetsComponent} from './result-sets/result-sets.component';

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: '', component: ProductsComponent, canActivate: [AuthGuard], children: [
    {
      path: 'product/:id', component: PlansComponent, children: [
      {
        path: 'plan/:id', component: RunsComponent, children: [
        { path: 'run/:id', component: ResultSetsComponent }
      ]
      }
    ]
    }
  ]
  }
  // {path: 'product/:id', component: ProductsComponent, canActivate: [AuthGuard]},
  // {path: 'product/:id', component: PlansComponent, canActivate: [AuthGuard], outlet: 'plans'},
  // {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    MainComponent,
    TopToolbarComponent,
    ProductsComponent,
    PlansComponent,
    RunsComponent,
    NotFoundComponent,
    LoginComponent,
    ResultSetsComponent
  ],
  imports: [BrowserModule, HttpModule, RouterModule.forRoot(appRoutes), FormsModule],
  providers: [AuthGuard, AuthenticationService],
  bootstrap: [MainComponent]
})
export class AppModule {
}
