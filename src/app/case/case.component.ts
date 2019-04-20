import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  update_click() {}

}
