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
  loading = false;
  load_form = false;
  error = '';

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
    this.authenticationService.get_no_user_status().then(data => {
      if (data['no_users']) {
        this.router.navigate(['/registration']);
      } else {
        this.load_form = true;
      }
    });
  }

  login() {
    this.loading = true;
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
