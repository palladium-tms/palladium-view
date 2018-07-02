import '../polyfills';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TopToolbarComponent} from './top-toolbar/top-toolbar.component';
import {ProductsComponent} from './products/products.component';
import {HttpClientModule} from '@angular/common/http';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from './_guards/auth.guard';
import {AuthenticationService} from '../services/authentication.service';
import {LocalSettingsService} from '../services/local-settings.service';
import {StatisticService} from '../services/statistic.service';
import {PalladiumApiService} from '../services/palladium-api.service';
import {HttpService} from '../services/http-request.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import {SortByCreatedAtPipe} from './pipes/sort-by-created-at/sort-by-created-at.pipe';
import {SortByUpdatedAtPipe} from './pipes/sort-by-created-at/sort-by-updated-at.pipe';
import {TokenComponent} from './top-toolbar/token/token.component';
import {CasesComponent} from './cases/cases.component';
import {FiltersComponent} from './page-component/filters/filters.component';
import {StatusComponent} from './page-component/status/status.component';
import {StatisticFilterPipe} from './pipes/statistic-filter/statistic-filter.pipe';
import {AboutComponent} from './top-toolbar/about/about.component';
import {StatusSettingsComponent} from './top-toolbar/status-settings/status-settings.component';
import {RunComponent} from './runs/run/run.component';
import {SuiteComponent} from './runs/suite/suite.component';
import {DetailResultComponent} from './detail-result/detail-result.component';
import {CaseHistoryComponent} from './case-history/case-history.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductSettingsComponent } from './product-settings/product-settings.component';
import { CaseComponent } from './case/case.component';
import { InviteComponent } from './top-toolbar/invite/invite.component';
import { SortByNamePipe } from './pipes/sort-by-name/sort-by-name.pipe';
import { ResultValueComponent } from './page-component/result-value/result-value.component';
import { DndListModule } from 'ngx-drag-and-drop-lists';
import {CdkTableModule} from '@angular/cdk/table';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { CopyButtonComponent } from './page-component/copy-button/copy-button.component';

const appRoutes: Routes = [
  {path: 'singin', component: LoginComponent},
  {path: 'registration', component: RegistrationComponent},
  {
    path: '', component: ProductsComponent, canActivate: [AuthGuard], children: [
    {
      path: 'product/:id', component: PlansComponent, children: [
      {
        path: 'plan/:id', component: RunsComponent, children: [
        {
          path: 'run/:id', component: ResultSetsComponent, children: [
          {path: 'result_set/:id', component: ResultsComponent},
          {path: 'case/:id', component: CaseComponent},
          {path: 'case_history/:id', component: CaseHistoryComponent},
        ]
        },
        {path: 'suite/:id', component: CasesComponent}
      ]
      }
    ]
    }
  ]
  },
  {path: 'result/:id', component: DetailResultComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: '/404'},
];
@NgModule({  exports: [
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
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
    SortByCreatedAtPipe,
    SortByUpdatedAtPipe,
    TokenComponent,
    CasesComponent,
    FiltersComponent,
    StatusComponent,
    StatisticFilterPipe,
    AboutComponent,
    StatusSettingsComponent,
    RunComponent,
    SuiteComponent,
    DetailResultComponent,
    CaseHistoryComponent,
    ProductSettingsComponent,
    CaseComponent,
    InviteComponent,
    SortByNamePipe,
    ResultValueComponent,
    CopyButtonComponent,
  ],
  imports: [ModalModule, BrowserModule, HttpClientModule, RouterModule.forRoot(appRoutes), FormsModule,
    Angular2FontawesomeModule, BrowserAnimationsModule, DndListModule, ReactiveFormsModule,
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule],
  providers: [AuthGuard, AuthenticationService, StatisticService, PalladiumApiService, HttpService, LocalSettingsService],
  bootstrap: [MainComponent]
})
export class AppModule {
}
