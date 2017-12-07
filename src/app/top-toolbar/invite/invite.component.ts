import { Component, OnInit } from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {
  invite = null;

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

  get_invite(modal) {
    modal.open();
    this.ApiService.get_invite().then(invite => {
      this.invite = invite;
      console.log(this.invite);
    });
  }
}
