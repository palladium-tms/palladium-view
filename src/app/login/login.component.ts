import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettings } from '../../services/settings.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  moduleId: module.id,
  templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private settings: AppSettings
  ) { }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
  }

  login() {
    this.loading = true;
    // console.log(this.authenticationService.login(this.model.username, this.model.password));
    this.authenticationService.login(this.model.username, this.model.password)
      .then(result => {
        if (result === true) {
          // login successful
          this.router.navigate(['/']);
        } else {
          // login failed
          this.error = 'Username or password is incorrect';
          this.loading = false;
        }
      });
  }
}
