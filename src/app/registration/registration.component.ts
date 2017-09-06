import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { User } from '../models/user';

@Component({
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  public user: User;
  model: any = {};
  loading = false;
  error = '';
  ngOnInit(): void {
  }
  constructor(    private router: Router,
                  private authenticationService: AuthenticationService ) {
    this.user = {
      username: '',
      password: '',
      confirmPassword: ''
    };
  }
  registration() {
    this.loading = true;
    this.authenticationService.registration(this.model.username, this.model.password)
      .then(result => {
        this.router.navigate(['/login']);
        this.loading = false;
      }, errors => {
        if (errors.message.constructor.name === 'ProgressEvent') {
          this.error = 'Api server is not work';
        } else {
          this.error = this.get_error_from_message(errors.message);
        }
        this.loading = false;
      });
  }

  get_error_from_message(error: string): string {
    console.log('get_error_from_message');
    const errors = JSON.parse(error).errors;
    let message = '';
    if (errors.email !== undefined) {
      for (const current_error of errors.email) {
        message += current_error;
      }
    }
    return message;
  }
}
