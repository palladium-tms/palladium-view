import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {SidenavService} from '../../services/sidenav.service';

@Component({
  selector: 'app-top-toolbar',
  templateUrl: './top-toolbar.component.html',
  styleUrls: ['./top-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopToolbarComponent {
  authorize;
  productName;
  username;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              public sidenavService: SidenavService, private cd: ChangeDetectorRef) {

    sidenavService.selectedProduct$.subscribe(product => {
      this.productName = (product && product.name) || '';
      this.cd.detectChanges();
    });

    authenticationService.isAuthorized$.subscribe(status => {
      this.authorize = status;
      if (status) {
        this.username = JSON.parse(localStorage.getItem('auth_data'))['username'];
      }
      this.cd.detectChanges();
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


  settings_open() {
    this.router.navigate(['/settings']);
  }

  product_list_toggle() {
    this.sidenavService.toggle_product_list();
  }
}
