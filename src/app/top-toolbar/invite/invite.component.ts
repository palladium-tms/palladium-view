import { Component, OnInit } from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {
  invite;

  constructor(private ApiService: PalladiumApiService) { }

  ngOnInit() {}

  get_invite(modal) {
    modal.open();
    this.ApiService.generate_invite().then(invite => {
      console.log(invite);
      this.invite = invite;
    });
  }

  generate_registration_link() {
    return location.href + 'registration?invite=' + this.invite.token;
  }
}
