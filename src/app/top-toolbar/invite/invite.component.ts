import {Component, OnInit} from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html'
})
export class InviteComponent {
  constructor(private dialog: MatDialog) {}

  open() {
    this.dialog.open(InviteDialogComponent);
  }
}

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite.component.dialog.html',
})
export class InviteDialogComponent implements OnInit {
  invite;
  constructor(private ApiService: PalladiumApiService) {}

  async ngOnInit() {
    this.invite = await this.ApiService.get_invite();
  }
  async generate_invite() {
    this.invite = await this.ApiService.generate_invite()
  }
}
