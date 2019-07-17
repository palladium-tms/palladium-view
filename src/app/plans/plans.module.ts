import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PlansComponent, PlansSettingsComponent} from './plans.component';
import {AppMaterialModule} from '../app-material/app-material.module';
import {RouterModule, Routes} from '@angular/router';

const planRoutes: Routes = [{
  path: '', component: PlansComponent, children: [
    {
      path: 'plan/:id', loadChildren: '../runs/runs.module#RunsModule'
    }
  ]
}];

@NgModule({
  declarations: [PlansComponent, PlansSettingsComponent],
  imports: [RouterModule.forChild(planRoutes),
    CommonModule, AppMaterialModule
  ],
  entryComponents: [PlansSettingsComponent]
})
export class PlansModule {
}
