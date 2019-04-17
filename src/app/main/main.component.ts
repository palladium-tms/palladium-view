// Main component. Its begin of app
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {

  private authorize;
  constructor(private authenticationService: AuthenticationService) {
    authenticationService.isAuthorized$.subscribe( status => {
      this.authorize = status;
    });
  }

  ngOnInit() {
    this.authorize = (localStorage.getItem('auth_data') !== null);
    this.authenticationService.isAuthorized.next(this.authorize);
  }
}
