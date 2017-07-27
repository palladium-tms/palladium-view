import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TopToolbarComponent} from './top-toolbar/top-toolbar.component';
import {ProductsComponent} from './products/products.component';
import {HttpModule} from '@angular/http';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from './_guards/auth.guard';
import {AuthenticationService} from '../services/authentication.service';
import {StatusticService} from '../services/statistic.service';
import {FormsModule} from '@angular/forms';
import {MainComponent} from './main/main.component';
import {PlansComponent} from './plans/plans.component';
import {RunsComponent} from './runs/runs.component';
import {ResultSetsComponent} from './result-sets/result-sets.component';
import { ResultsComponent } from './results/results.component';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import {ModalModule} from 'ngx-modal';
import { RegistrationComponent } from './registration/registration.component';
import { EqualValidator } from './directives/equal-validator.directive';  // import validator
import { AppSettings } from '../services/settings.service';  // import validator


const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'registration', component: RegistrationComponent},
  {
    path: '', component: ProductsComponent, canActivate: [AuthGuard], children: [
    {
      path: 'product/:id', component: PlansComponent, children: [
      {
        path: 'plan/:id', component: RunsComponent, children: [
        { path: 'run/:id', component: ResultSetsComponent, children: [
          { path: 'result_set/:id', component: ResultsComponent }
        ] }
      ]
      }
    ]
    }
  ]
  },
  {path: '**', redirectTo: '/404'},
];

@NgModule({
  declarations: [
    MainComponent,
    TopToolbarComponent,
    ProductsComponent,
    PlansComponent,
    RunsComponent,
    LoginComponent,
    ResultSetsComponent,
    ResultsComponent,
    RegistrationComponent,
    EqualValidator,
  ],
  imports: [ModalModule, BrowserModule, HttpModule, RouterModule.forRoot(appRoutes, { useHash: true }), FormsModule,
    Angular2FontawesomeModule],
  providers: [AuthGuard, AuthenticationService, AppSettings, StatusticService],
  bootstrap: [MainComponent]
})
export class AppModule {
}
