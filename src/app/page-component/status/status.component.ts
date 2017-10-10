import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
  @Input() status_name: string;
  @Input() status_color: string;
  constructor() { }

  ngOnInit() {}
}
