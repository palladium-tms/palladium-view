import { NgModule } from '@angular/core';
import {ProductsComponent, ProductSettingsComponent} from './products.component';
import {RouterModule, Routes} from '@angular/router';
import {AppMaterialModule} from '../app-material/app-material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {TopToolbarComponent} from '../top-toolbar/top-toolbar.component';
import {TokenComponent, TokenDialogComponent} from '../top-toolbar/token/token.component';
import {InviteComponent, InviteDialogComponent} from '../top-toolbar/invite/invite.component';
import {AboutComponent, AboutDialogComponent} from '../top-toolbar/about/about.component';
import {StatusSettingsComponent, StatusSettingsDialogComponent} from '../top-toolbar/status-settings/status-settings.component';
import {AuthGuard} from '../_guards/auth.guard';

const productRoutes: Routes = [{ path: '', component: ProductsComponent, children: [
    {path: 'product/:id', loadChildren: '../plans/plans.module#PlansModule', canActivate: [AuthGuard]},
    {path: 'settings', loadChildren: '../settings/settings.module#SettingsModule'}
  ]}];

@NgModule({
  declarations: [ProductsComponent, ProductSettingsComponent,
    TopToolbarComponent,
    TokenComponent, TokenDialogComponent,
    InviteComponent, InviteDialogComponent,
    AboutComponent, AboutDialogComponent,
    StatusSettingsComponent,
    StatusSettingsDialogComponent],
  imports: [
    RouterModule.forChild(productRoutes),
    AppMaterialModule, DragDropModule
  ], entryComponents: [ProductSettingsComponent, TopToolbarComponent, TokenComponent, TokenDialogComponent, InviteComponent, InviteDialogComponent,
    AboutComponent,
    AboutDialogComponent,
    StatusSettingsComponent,
    StatusSettingsDialogComponent]
})
export class ProductsModule {}
// , children: [
//   {
//     path: 'product/:id', component: PlansComponent, children: [
//       {
//         path: 'plan/:id', component: RunsComponent, children: [
//           {
//             path: 'run/:id', component: ResultSetsComponent, children: [
//               {path: 'result_set/:id', component: ResultsComponent},
//               {path: 'case/:id', component: CaseComponent},
//               {path: 'case_history/:id', component: CaseHistoryComponent},
//             ]
//           },
//           {path: 'suite/:id', component: CasesComponent}
//         ]
//       }
//     ]
//   }, {path: 'settings', component: SettingsComponent, canActivate: [AuthGuard]},
// ]
