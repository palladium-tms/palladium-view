import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent} from './login.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatInputModule} from '@angular/material';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: LoginComponent}]),
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
  ]
})
export class LoginModule { }
