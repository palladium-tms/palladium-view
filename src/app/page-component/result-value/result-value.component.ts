import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-result-value',
  templateUrl: './result-value.component.html',
  styleUrls: ['./result-value.component.css']
})
export class ResultValueComponent implements OnInit {

  @Input() value;
  @Input() type;
  @Input() note;
  constructor() { }
  ngOnInit() { }
}
