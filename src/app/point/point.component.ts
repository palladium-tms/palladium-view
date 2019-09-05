import {Component, Input, OnInit} from '@angular/core';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.scss']
})
export class PointComponent implements OnInit {
  @Input() point;
  constructor(private palladiumApiService: PalladiumApiService,) { }

  ngOnInit() {}

}
