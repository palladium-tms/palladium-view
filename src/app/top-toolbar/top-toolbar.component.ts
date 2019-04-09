import {Component, DoCheck} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {SidenavService} from '../../services/sidenav.service';

@Component({
  selector: 'app-top-toolbar',
  templateUrl: './top-toolbar.component.html',
  styleUrls: ['./top-toolbar.component.scss'],
})
export class TopToolbarComponent implements DoCheck {
  authorize;
  productName;
  username;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              public sidenavService: SidenavService) {
    sidenavService.get_product_subject$.subscribe(productName => {
      this.productName = productName;
    });

    this.username = JSON.parse(localStorage.getItem('auth_data'))['username'];
  }

  ngDoCheck() {
    this.authorize = (this.authenticationService.saved_token() != null);
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
