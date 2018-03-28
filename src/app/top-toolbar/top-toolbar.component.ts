import {Component, OnInit, DoCheck, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-top-toolbar',
  templateUrl: './top-toolbar.component.html',
  styleUrls: ['./top-toolbar.component.css'],
  providers: [PalladiumApiService]
})
export class TopToolbarComponent implements OnInit, DoCheck {
  public authorize;
  public statuses = {};
  @ViewChild('Modal') Modal;

  constructor(private router: Router,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
  }

  ngDoCheck() {
    this.authorize = (this.authenticationService.saved_token() != null);
  }

  logout() {
    this.authenticationService.logout();
    this.authorize = (this.authenticationService.saved_token() != null);
    this.router.navigate(['/singin']);
  }
}
