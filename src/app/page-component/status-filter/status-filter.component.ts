import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss']
})
export class StatusFilterComponent implements OnInit {
  @Input() status;
  @Input() count;
  @Output() select = new EventEmitter();
  selected;
  constructor() { }

  ngOnInit() {
    this.selected = this.status.active;
  }

  get_background_color() {
    if (this.selected) {
      return this.status.color;
    }
  }

  get_border_color() {
    if (!this.selected) {
      return this.status.color
    }
  }

  select_status() {
    this.selected = !this.selected;
    this.status.active = !this.selected;
    this.select.emit([this.status]);
  }
}