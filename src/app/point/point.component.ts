import {Component, Input, OnInit} from '@angular/core';
import {PalladiumApiService, StructuredStatuses} from '../../services/palladium-api.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.scss']
})
export class PointComponent implements OnInit {
  @Input() point;
  @Input() filter;
  statuses$: Observable<StructuredStatuses>;

  constructor(private palladiumApiService: PalladiumApiService,) { }

  ngOnInit() {
    this.statuses$ = this.palladiumApiService.statuses$;
  }

}
