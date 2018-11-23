import {Component, OnInit, ViewChild} from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  invite = null;
  @ViewChild('Modal') Modal;

  constructor(private ApiService: PalladiumApiService) { }

  ngOnInit() {}

  generate_invite() {
    this.ApiService.generate_invite().then(invite => {
      this.invite = invite;
    });
  }

  generate_registration_link() {
    return location.host + '/#/registration?invite=' + this.invite.token;
  }

  open() {
    this.Modal.open();
    this.ApiService.get_invite().then(invite => {
      this.invite = invite;
    });
  }
}
