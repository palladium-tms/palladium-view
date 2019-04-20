import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-result-value',
  templateUrl: './result-value.component.html',
  styleUrls: ['./result-value.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultValueComponent implements OnInit {

  @Input() value;
  @Input() type;
  @Input() note;
  constructor() { }
  ngOnInit() { }
}
