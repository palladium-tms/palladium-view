import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  moduleId: module.id,
  styleUrls: ['./login.component.css'],
  templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
  model: any = {};
  no_users = false;
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
    this.authenticationService.get_no_user_status().then(data => {
      this.no_users = data['no_users'];
    });
  }

  login() {
    this.loading = true;
    // console.log(this.authenticationService.login(this.model.username, this.model.password));
    this.authenticationService.login(this.model.username, this.model.password)
      .then(result => {
          this.router.navigate(['/']);
        this.loading = false;
      }, error => {
        this.error = 'Username or password is incorrect';
        this.loading = false;
      });
  }
}
