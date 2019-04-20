import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {FormControl, Validators, FormGroup} from '@angular/forms';

@Component({
  moduleId: module.id,
  styleUrls: ['./login.component.css'],
  templateUrl: 'login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoginComponent implements OnInit, OnDestroy {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,6}$'), Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });
  loading = false;
  error = '';

  constructor(private router: Router,
              private authenticationService: AuthenticationService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.authenticationService.logout();
    this.cd.detectChanges();
  }

  get email() { return this.loginForm.get('email'); }

  get password() { return this.loginForm.get('password'); }

  login() {
    this.loading = true;
    this.authenticationService.login(this.email.value, this.password.value)
      .then(() => {
        this.router.navigate(['/']);
        this.loading = false;
      }, () => {
        this.error = 'Username or password is incorrect';
        this.loading = false;
        this.cd.detectChanges();
      });
  }

  ngOnDestroy() {
    this.cd.detach();
  }
}
