import { Component, OnInit, DoCheck } from '@angular/core';
import { AuthenticationService } from '../../servises/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-toolbar',
  templateUrl: './top-toolbar.component.html',
  styleUrls: ['./top-toolbar.component.css']
})
export class TopToolbarComponent implements OnInit, DoCheck {
  public authorize;
  constructor(     private router: Router,
                   private authenticationService: AuthenticationService ) { }
  ngOnInit() {
  console.log(this.authorize);
  }
  ngDoCheck() {
    this.authorize = (this.authenticationService.saved_token() != null);
  }
  logout() {
    this.authenticationService.logout();
    this.authorize = (this.authenticationService.saved_token() != null);
    this.router.navigate(['/login']);
  }
}
