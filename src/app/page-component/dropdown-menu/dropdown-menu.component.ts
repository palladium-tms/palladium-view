import {Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./dropdown-menu.component.css']
})
export class DropdownMenuComponent implements OnInit {
  visibility = false;

  @Input() statuses;
  @Input() current_status;
  @Output() set_status = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {}

  select_status(id) {
    this.visibility = false;
    this.set_status.emit(id);
  }

  close() {
    this.visibility = false;
  }
}
