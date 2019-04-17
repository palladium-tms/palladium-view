import {Component} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {SidenavService} from '../../services/sidenav.service';

@Component({
  selector: 'app-top-toolbar',
  templateUrl: './top-toolbar.component.html',
  styleUrls: ['./top-toolbar.component.scss'],
})
export class TopToolbarComponent {
  authorize;
  productName;
  username;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              public sidenavService: SidenavService) {
    sidenavService.get_product_subject$.subscribe(productName => {
      this.productName = productName;
    });
    authenticationService.isAuthorized$.subscribe(status => {
      this.authorize = status;
    });
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      this.username = JSON.parse(localStorage.getItem('auth_data'))['username'];
    }
  }

  logout() {
    this.authenticationService.logout();
    this.authorize = (this.authenticationService.saved_token() != null);
    this.router.navigate(['/singin']);
  }

  product_list_toggle() {
    this.sidenavService.toggle_product_list();
  }
}
