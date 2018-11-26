import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PalladiumApiService} from '../../../services/palladium-api.service';
import {MatDialog} from '@angular/material';


@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss'],
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
})

export class TokenDialogComponent {
  tokens = [];
  token_form = new FormGroup({
    name: new FormControl('',  [Validators.required])
  });

  constructor(private ApiService: PalladiumApiService) {
    this.ApiService.get_tokens().then(tokens => {
      this.tokens = tokens;
    });
  }

  get name() { return this.token_form.get('name'); }

  create_token() {
    console.log(this.name.value);
    this.ApiService.create_token(this.name.value).then(token => {
      this.tokens.push(token['token_data']);
    });
  }
}
