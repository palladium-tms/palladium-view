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
      .subscribe(result => {
        if (result === true) {
          // login successful
          this.router.navigate(['/login']);
        } else {
          // login failed
          this.error = 'Email or password is incorrect';
          this.loading = false;
        }
      });
  }
}
