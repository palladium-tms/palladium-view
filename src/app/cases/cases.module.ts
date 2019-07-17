import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {CasesComponent} from './cases.component';
import {AppMaterialModule} from '../app-material/app-material.module';
import {ScrollingModule} from '@angular/cdk/scrolling';

const caseRoutes: Routes = [{ path:  '', component: CasesComponent}];

@NgModule({
  declarations: [CasesComponent],
  imports: [
    CommonModule, RouterModule.forChild(caseRoutes), AppMaterialModule, ScrollingModule
  ]
})
export class CasesModule { }
