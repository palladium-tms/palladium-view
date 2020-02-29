import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteDialogComponent implements OnInit, OnDestroy {
  mode: 'empty' | 'exist' | 'loading' | 'generating' = 'loading';
  invite;
  constructor(private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef) {}

  async ngOnInit() {
    // this.invite = await this.palladiumApiService.get_invite();
    // if (this.invite) {
    //   this.mode = 'exist';
    // } else {
    //   this.mode = 'empty';
    // }
    this.cd.detectChanges();
  }

  async generate_invite() {
    this.mode = 'generating';
    // this.invite = await this.palladiumApiService.generate_invite();
    this.mode = 'exist';
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.cd.detach();
  }
}
