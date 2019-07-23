import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RegistrationComponent} from './registration.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatIconModule, MatInputModule} from '@angular/material';

@NgModule({
  declarations: [RegistrationComponent],
  imports: [
    RouterModule.forChild([{path: '', component: RegistrationComponent}]),
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class RegistrationModule {
}
