import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService, Token} from '../../../services/palladium-api.service';
import { MatDialog } from '@angular/material/dialog';
import {Observable} from "rxjs";

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenComponent {

  constructor(public dialog: MatDialog) { }

  open() {
    this.dialog.open(TokenDialogComponent);
  }
}
@Component({
  selector: 'app-token-dialog',
  templateUrl: 'app-token-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TokenDialogComponent implements OnInit, OnDestroy {
  tokens$: Observable<Token[]>;
  tokenForm = new FormGroup({
    name: new FormControl('',  [Validators.required])
  });

  constructor(private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.tokens$ = this.palladiumApiService.get_tokens();
  }

  get name() { return this.tokenForm.get('name'); }

  create_token(): void {
    this.palladiumApiService.create_token(this.name.value).then(token => {
      this.tokens.push(token['token_data']);
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.cd.detach();
  }
}
