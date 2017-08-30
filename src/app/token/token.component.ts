import { Component, OnInit } from '@angular/core';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css'],
  providers: [PalladiumApiService]
})
export class TokenComponent implements OnInit {
  tokens;
  constructor( private ApiService: PalladiumApiService) { }

  ngOnInit() {
    this.get_tokens();
  }

  get_tokens() {
    this.ApiService.get_tokens().then(tokens => {
      this.tokens = tokens;
    });
  }

  create_token(form: NgForm) {
    this.ApiService.create_token(form.value).then(token => {
      this.tokens.push(token['token_data']);
    });
  }
}
