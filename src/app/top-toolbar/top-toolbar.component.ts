import {Component, DoCheck, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {SidenavService} from '../../services/sidenav.service';

@Component({
  selector: 'app-top-toolbar',
  templateUrl: './top-toolbar.component.html',
  styleUrls: ['./top-toolbar.component.scss'],
})
export class TopToolbarComponent implements DoCheck {
  public authorize;
  public statuses = {};
  product_name;
  @ViewChild('Modal') Modal;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
               public sidenav_service: SidenavService) {
    sidenav_service.get_product_subject$.subscribe( product_name => {
      this.product_name = product_name;
    });

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
    this.sidenav_service.toggle_product_list();
  }
}
