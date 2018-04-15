import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {FormControl, Validators, FormGroup} from '@angular/forms';

@Component({
  moduleId: module.id,
  styleUrls: ['./login.component.css'],
  templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
  email = new FormControl('', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,6}$'), Validators.required]);
  password = new FormControl('', [Validators.required, Validators.minLength(4)]);
  login_form = new FormGroup({
    email: this.email,
    password: this.password,
  });
  model: any = {};
  loading = false;
  load_form = false;
  hide = true;
  error = '';

  constructor(private router: Router,
              private authenticationService: AuthenticationService) {
  }

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
