import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';

@Component({
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  loading = false;
  error = 'Invite key not found';
  registration_hidden = true;
  invite;
  no_users = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
      this.invite = this.activatedRoute.snapshot.queryParams['invite'];
      if (this.invite === undefined) {
        this.invite = null;
      }
      this.get_no_users_flag();
  }

  registration(form: NgForm, valid: boolean) {
    if (valid) {
      this.loading = true;
      this.authenticationService.registration(form.value['username'], form.value['password'], this.invite)
        .then(result => {
          if (result['errors'].length === 0) {
            this.router.navigate(['/login']);
          } else {
            this.invite = null;
            this.error = result['errors'];
          }
          this.loading = false;
        }, errors => {
          this.loading = false;
        });
    }
  }

  get_no_users_flag() {
    this.authenticationService.get_no_user_status().then(data => {
      console.log(data['no_users']);
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
