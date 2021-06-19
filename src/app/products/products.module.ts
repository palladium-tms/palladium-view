import {NgModule} from '@angular/core';
import {ProductsComponent, ProductSettingsComponent, ProductsCreateComponent} from './products.component';
import {RouterModule, Routes} from '@angular/router';
import {AppMaterialModule} from '../app-material/app-material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {TopToolbarComponent} from '../top-toolbar/top-toolbar.component';
import {TokenComponent, TokenDialogComponent} from '../top-toolbar/token/token.component';
import {InviteComponent, InviteDialogComponent} from '../top-toolbar/invite/invite.component';
import {AboutComponent, AboutDialogComponent} from '../top-toolbar/about/about.component';
import {
  StatusSettingsComponent,
  StatusSettingsDialogComponent
} from '../top-toolbar/status-settings/status-settings.component';
import {PlansComponent, PlansSettingsComponent, PlansCreateComponent} from '../plans/plans.component';
import {RunsComponent, RunsSettingsComponent} from '../runs/runs.component';
import {ResultSetsComponent, ResultSetsSettingsComponent} from '../result-sets/result-sets.component';
import {ResultsComponent} from 'app/results/results.component';
import {CaseHistoryComponent} from '../case-history/case-history.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {StatisticService} from '../../services/statistic.service';
import {StanceService} from '../../services/stance.service';
import {CasesComponent} from '../cases/cases.component';
import {PointComponent} from '../point/point.component';
import {StatisticBarComponent} from '../statistic-bar/statistic-bar.component';
import { StatisticComponent } from '../statistic/statistic.component';
import { NgDatePipesModule } from 'ngx-pipes';

const productRoutes: Routes = [{
  path: '', component: ProductsComponent, children: [
    {
      path: 'product/:id', component: PlansComponent, children: [
        {
          path: 'plan/:id', component: RunsComponent, children: [
            {
              path: 'run/:id', component: ResultSetsComponent, children: [
                {path: 'result_set/:id', component: ResultsComponent, children: [
                    {path: 'case_history', component: CaseHistoryComponent}
                  ]},
              ]
            }, {path: 'suite/:id', component: CasesComponent}
          ]
        }
      ]
    },
    {path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)}
  ]
}];

@NgModule({
  declarations: [ProductsComponent, ProductSettingsComponent, ProductsCreateComponent, CasesComponent, PointComponent, StatisticBarComponent, StatisticComponent,
    TopToolbarComponent,
    TokenComponent, TokenDialogComponent,
    InviteComponent, InviteDialogComponent,
    AboutComponent, AboutDialogComponent,
    StatusSettingsComponent,
    StatusSettingsDialogComponent, PlansComponent, RunsComponent, ResultSetsComponent, ResultsComponent, CaseHistoryComponent, ResultSetsSettingsComponent,
    PlansSettingsComponent, PlansCreateComponent, RunsSettingsComponent
],
  imports: [
    RouterModule.forChild(productRoutes),
    AppMaterialModule, DragDropModule, ScrollingModule, NgDatePipesModule,
  ],
  entryComponents: [ProductSettingsComponent, ProductsCreateComponent, TopToolbarComponent, TokenComponent, TokenDialogComponent, InviteComponent, InviteDialogComponent,
    AboutComponent,
    AboutDialogComponent,
    StatusSettingsComponent,
    StatusSettingsDialogComponent, ResultSetsSettingsComponent, PlansSettingsComponent, PlansCreateComponent, RunsSettingsComponent],
  providers: [StatisticService, StanceService]
})
export class ProductsModule {
}
