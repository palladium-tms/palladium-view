import {Component, OnInit} from '@angular/core';
import {PalladiumApiService} from './servises/palladium-api.service';
@Component({
  selector: 'app-products',
  template: `<ul>
    {{products}}
    <li *ngFor="let product of products">
      <p>Имя пользователя: {{product}}</p>
      <p>Возраст пользователя: {{product}}</p>
    </li>
  </ul>
  <pre id="custom-spacing">{{ heroes | json:4 }}</pre>
  `,
  providers: [PalladiumApiService],
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  // title = 'app works!';
  heroes: {};
  errorMessage;
  constructor(private httpService: PalladiumApiService) {}

  ngOnInit() {
    this.httpService.getData('/products')
      .subscribe(
        heroes => {
          this.heroes = heroes;
        },
        error =>  this.errorMessage = <any>error);
  }
}
