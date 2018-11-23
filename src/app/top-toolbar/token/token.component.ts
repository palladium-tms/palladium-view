import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {PalladiumApiService} from '../../../services/palladium-api.service';


@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss'],
})
export class TokenComponent implements OnInit {
  tokens;
  creating = false;
  @ViewChild('Modal') Modal;

  constructor(private ApiService: PalladiumApiService) { }

  ngOnInit() {}

  open() {
    this.Modal.open();
    this.ApiService.get_tokens().then(tokens => {
      this.tokens = tokens;
    });

  }
  create_token(form: NgForm) {
    this.ApiService.create_token(form.value).then(token => {
      this.tokens.push(token['token_data']);
      this.creating = false;
    });
  }
}
