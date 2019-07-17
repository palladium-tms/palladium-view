import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {RunsComponent, RunsSettingsComponent} from './runs.component';
import {AppMaterialModule} from '../app-material/app-material.module';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {StatisticService} from '../../services/statistic.service';

const runRoutes: Routes = [{ path:  '', component: RunsComponent, children: [
    {
      path: 'run/:id', loadChildren: '../result-sets/result-sets.module#ResultSetsModule'
    },
    {
      path: 'suite/:id', loadChildren: '../cases/cases.module#CasesModule'
    }
  ]}];

@NgModule({
  declarations: [RunsComponent, RunsSettingsComponent],
  imports: [
    CommonModule, RouterModule.forChild(runRoutes), AppMaterialModule, ScrollingModule
  ], entryComponents: [RunsSettingsComponent], providers: [StatisticService]
})
export class RunsModule { }
