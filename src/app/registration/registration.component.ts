import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  moduleId: module.id,
  styleUrls: ['registration.component.css'],
  templateUrl: 'registration.component.html'
})
export class RegistrationComponent implements OnInit {
  loading = false;
  error;
  registration_hidden = true;
  invite;
  model: any = {};
  no_users = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
      this.invite = this.activatedRoute.snapshot.queryParams['invite'];
      if (this.invite === undefined) {
        this.invite = null;
      }
      this.get_no_users_flag();
  }

  registration(form) {
      this.loading = true;
      this.authenticationService.registration(form.value['username'], form.value['password'], this.invite)
        .then(result => {
          if (result['errors'].length === 0) {
            this.login(form.value['username'], form.value['password']);
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
