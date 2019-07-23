import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from './settings.component';
import {AppMaterialModule} from '../app-material/app-material.module';
import {ProfileSettingsComponent} from './profile-settings/profile-settings.component';

const settingsRoutes: Routes = [{path: '', component: SettingsComponent}];

@NgModule({
  declarations: [SettingsComponent, ProfileSettingsComponent],
  imports: [
    CommonModule, RouterModule.forChild(settingsRoutes), AppMaterialModule
  ]
})

export class SettingsModule {
}
