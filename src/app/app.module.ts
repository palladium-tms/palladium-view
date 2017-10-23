import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TopToolbarComponent} from './top-toolbar/top-toolbar.component';
import {ProductsComponent} from './products/products.component';
import {HttpModule} from '@angular/http';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from './_guards/auth.guard';
import {AuthenticationService} from '../services/authentication.service';
import {LocalSettingsService} from '../services/local-settings.service';
import {StatisticService} from '../services/statistic.service';
import {PalladiumApiService} from '../services/palladium-api.service';
import {HttpService} from '../services/http-request.service';
import {FormsModule} from '@angular/forms';
import {MainComponent} from './main/main.component';
import {PlansComponent} from './plans/plans.component';
import {RunsComponent} from './runs/runs.component';
import {ResultSetsComponent} from './result-sets/result-sets.component';
import {ResultsComponent} from './results/results.component';
import {Angular2FontawesomeModule} from 'angular2-fontawesome/angular2-fontawesome';
import {ModalModule} from 'ngx-modal';
import {RegistrationComponent} from './registration/registration.component';
import {EqualValidator} from './directives/equal-validator.directive';  // import validator
import {StatusFilterPipe} from './pipes/status_filter_pipe/status-filter.pipe';
import {SelectModule} from 'ng2-select';
import {StatusSelectorComponent} from './page-component/status-selector/status-selector.component';
import {SortByCreatedAtPipe} from './pipes/sort-by-created-at/sort-by-created-at.pipe';
import {TokenComponent} from './top-toolbar/token/token.component';
import {CasesComponent} from './cases/cases.component';
import {FiltersComponent} from './page-component/filters/filters.component';
import {StatusComponent} from './page-component/status/status.component';
import {StatisticFilterPipe} from './pipes/statistic-filter/statistic-filter.pipe';
import {AboutComponent} from './top-toolbar/about/about.component';
import {StatusSettingsComponent} from './top-toolbar/status-settings/status-settings.component';
import { RunComponent } from './runs/run/run.component';
import { SuiteComponent } from './runs/suite/suite.component';

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'registration', component: RegistrationComponent},
  {
    path: '', component: ProductsComponent, canActivate: [AuthGuard], children: [
    {
      path: 'product/:id', component: PlansComponent, children: [
      {
        path: 'plan/:id', component: RunsComponent, children: [
        {
          path: 'run/:id', component: ResultSetsComponent, children: [
          {path: 'result_set/:id', component: ResultsComponent}
        ]
        },
        {path: 'suite/:id', component: CasesComponent}
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
    StatusFilterPipe,
    StatusSelectorComponent,
    SortByCreatedAtPipe,
    TokenComponent,
    CasesComponent,
    FiltersComponent,
    StatusComponent,
    StatisticFilterPipe,
    AboutComponent,
    StatusSettingsComponent,
    RunComponent,
    SuiteComponent
  ],
  imports: [ModalModule, BrowserModule, HttpModule, RouterModule.forRoot(appRoutes, {useHash: true}), FormsModule,
    Angular2FontawesomeModule, SelectModule],
  providers: [AuthGuard, AuthenticationService, StatisticService, PalladiumApiService, HttpService, LocalSettingsService],
  bootstrap: [MainComponent]
})
export class AppModule {
}
