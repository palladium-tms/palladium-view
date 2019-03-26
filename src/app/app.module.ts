import '../polyfills';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from './_guards/auth.guard';
import {AuthenticationService} from '../services/authentication.service';
import {LocalSettingsService} from '../services/local-settings.service';
import {StatisticService} from '../services/statistic.service';
import {SidenavService} from '../services/sidenav.service';
import {PalladiumApiService} from '../services/palladium-api.service';
import {HttpService} from '../services/http-request.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MainComponent} from './main/main.component';
import {PlansComponent, PlansSettingsComponent} from './plans/plans.component';
import {RunsComponent, RunsSettingsComponent} from './runs/runs.component';
import {ResultSetsComponent, ResultSetsSettingsComponent} from './result-sets/result-sets.component';
import {ResultsComponent} from './results/results.component';
import {Angular2FontawesomeModule} from 'angular2-fontawesome/angular2-fontawesome';
import {RegistrationComponent} from './registration/registration.component';
import {EqualValidator} from './directives/equal-validator.directive';  // import validator
import {StatusFilterPipe} from './pipes/status_filter_pipe/status-filter.pipe';
import {SortByCreatedAtPipe} from './pipes/sort-by-created-at/sort-by-created-at.pipe';
import {SortByUpdatedAtPipe} from './pipes/sort-by-created-at/sort-by-updated-at.pipe';
import {TokenComponent, TokenDialogComponent} from './top-toolbar/token/token.component';
import {CasesComponent} from './cases/cases.component';
import {FiltersComponent} from './page-component/filters/filters.component';
import {StatisticFilterPipe} from './pipes/statistic-filter/statistic-filter.pipe';
import {AboutComponent, AboutDialogComponent} from './top-toolbar/about/about.component';
import {StatusSettingsComponent, StatusSettingsDialogComponent} from './top-toolbar/status-settings/status-settings.component';
import {DetailResultComponent} from './detail-result/detail-result.component';
import {CaseHistoryComponent} from './case-history/case-history.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductsComponent, ProductSettingsComponent } from './products/products.component';
import { CaseComponent } from './case/case.component';
import {InviteComponent, InviteDialogComponent} from './top-toolbar/invite/invite.component';
import { SortByNamePipe } from './pipes/sort-by-name/sort-by-name.pipe';
import { ResultValueComponent } from './page-component/result-value/result-value.component';
import { DndListModule } from 'ngx-drag-and-drop-lists';
import {CdkTableModule} from '@angular/cdk/table';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {
  ErrorStateMatcher,
  MatAutocompleteModule, MatBadgeModule,
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
  MatTooltipModule, ShowOnDirtyErrorStateMatcher,
} from '@angular/material';
import { SearchPipe } from './pipes/search/search.pipe';
import { SearchBarComponent } from './page-component/search-bar/search-bar.component';
import { VirtualscrollPipe } from './pipes/virtual-scroll/virtualscroll.pipe';
import { DropdownMenuComponent } from './page-component/dropdown-menu/dropdown-menu.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import {TopToolbarComponent} from './top-toolbar/top-toolbar.component';
import { StatusFilterComponent } from './page-component/status-filter/status-filter.component';
import {ScrollingModule} from '@angular/cdk/scrolling';

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
    ScrollingModule,
    DragDropModule,
    CdkTableModule,
    MatAutocompleteModule, MatBadgeModule,
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
    PlansSettingsComponent,
    RunsComponent,
    RunsSettingsComponent,
    LoginComponent,
    ResultSetsComponent,
    ResultSetsSettingsComponent,
    ResultsComponent,
    RegistrationComponent,
    EqualValidator,
    StatusFilterPipe,
    SortByCreatedAtPipe,
    SortByUpdatedAtPipe,
    TokenComponent,
    TokenDialogComponent,
    CasesComponent,
    FiltersComponent,
    StatisticFilterPipe,
    AboutComponent,
    AboutDialogComponent,
    StatusSettingsComponent,
    StatusSettingsDialogComponent,
    DetailResultComponent,
    CaseHistoryComponent,
    ProductSettingsComponent,
    CaseComponent,
    InviteComponent,
    InviteDialogComponent,
    SortByNamePipe,
    ResultValueComponent,
    SearchPipe,
    SearchBarComponent,
    VirtualscrollPipe,
    DropdownMenuComponent,
    ClickOutsideDirective,
    StatusFilterComponent
  ],
  imports: [BrowserModule, HttpClientModule, RouterModule.forRoot(appRoutes), FormsModule,
    Angular2FontawesomeModule, BrowserAnimationsModule, DndListModule, ReactiveFormsModule,
    CdkTableModule,
    DragDropModule,
    MatAutocompleteModule, MatBadgeModule,
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
    ScrollingModule],
  providers: [AuthGuard, AuthenticationService, StatisticService, PalladiumApiService, HttpService, SidenavService,
    LocalSettingsService, {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}],
  bootstrap: [MainComponent],
  entryComponents: [TokenComponent, TokenDialogComponent, InviteComponent, InviteDialogComponent,
    AboutComponent,
    AboutDialogComponent,
    StatusSettingsComponent,
    StatusSettingsDialogComponent,
    ProductsComponent,
    ProductSettingsComponent,
    PlansComponent,
    PlansSettingsComponent,
    RunsComponent,
    RunsSettingsComponent,
    ResultSetsComponent,
    ResultSetsSettingsComponent],
})
export class AppModule {
}
