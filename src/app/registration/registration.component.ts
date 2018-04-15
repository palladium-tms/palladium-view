import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import {ValidatePassword} from './registration_form_validates/password_is_not_matches_validate';

@Component({
  moduleId: module.id,
  styleUrls: ['registration.component.css'],
  templateUrl: 'registration.component.html'
})

export class RegistrationComponent implements OnInit {
  email = new FormControl('', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,6}$'), Validators.required]);
  pwd = new FormControl('', [Validators.required, Validators.minLength(4)]);
  confirmpwd = new FormControl('', [Validators.required, Validators.minLength(4)]);
  registration_form = new FormGroup({
    email: this.email,
    password: new FormGroup({
      pwd: this.pwd,
      confirmpwd: this.confirmpwd
    }, ValidatePassword),
  });
  loading = false;
  error;
  registration_hidden = true;
  invite;
  hide_pwd = true;
  hide_confirmpwd = true;
  no_users = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.invite = this.activatedRoute.snapshot.queryParams['invite'];
    if (this.invite === undefined) {
      this.invite = null;
    }
    this.get_no_users_flag();
  }

  registration() {
    this.loading = true;
    this.authenticationService.registration(this.email.value, this.pwd.value, this.invite)
      .then(result => {
        if (result['errors'].length === 0) {
          this.login(this.email.value, this.pwd.value);
        } else {
          this.invite = null;
          this.error = result['errors'];
        }
        this.loading = false;
      }, errors => {
        this.loading = false;
      });
  }

  login(username, password) {
    this.authenticationService.login(username, password)
      .then(result => {
        this.router.navigate(['/']);
        this.loading = false;
      }, error => {
        this.error = 'Username or password is incorrect';
        this.loading = false;
      });
  }

  get_no_users_flag() {
    this.authenticationService.get_no_user_status().then(data => {
      this.hide_registration(data['no_users']);
    });
  }

  hide_registration(no_users) {
    if (no_users) {
      this.registration_hidden = false;
    } else {
      this.registration_hidden = (this.invite === null);
    }
  }
}
