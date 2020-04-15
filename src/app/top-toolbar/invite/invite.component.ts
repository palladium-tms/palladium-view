import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';
import { MatDialog } from '@angular/material/dialog';
import {Observable} from "rxjs";
import {Invite} from "../../models/invite";

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
  invite$: Observable<Invite>;
  constructor(private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.palladiumApiService.generate_invite();
    this.invite$ = this.palladiumApiService.invite$.map(x => {
      return x;
    });
  }

  ngOnDestroy(): void {
    this.cd.detach();
  }
}
