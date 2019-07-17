import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppMaterialModule} from 'app/app-material/app-material.module';
import {RouterModule, Routes} from '@angular/router';
import {ResultSetsComponent, ResultSetsSettingsComponent} from './result-sets.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CaseHistoryComponent} from '../case-history/case-history.component';

const resultsetsRoutes: Routes = [{
  path: '', component: ResultSetsComponent, children: [
    {
      path: 'result_set/:id', loadChildren: '../results/results.module#ResultsModule'
    }
  ]
}];

@NgModule({
  declarations: [ResultSetsComponent, ResultSetsSettingsComponent, CaseHistoryComponent],
  imports: [
    CommonModule, AppMaterialModule, RouterModule.forChild(resultsetsRoutes), ScrollingModule
  ], entryComponents: [ResultSetsSettingsComponent]
})
export class ResultSetsModule {
}
