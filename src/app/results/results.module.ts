import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ResultsComponent} from './results.component';
import {AppMaterialModule} from '../app-material/app-material.module';


const resultRoutes: Routes = [{
  path: '', component: ResultsComponent, children: [
    {
      path: 'run/:id', loadChildren: '../results/results.module#ResultsModule'
    }
  ]
}];

@NgModule({
  declarations: [ResultsComponent],
  imports: [
    CommonModule, AppMaterialModule, RouterModule.forChild(resultRoutes)
  ]
})
export class ResultsModule { }
