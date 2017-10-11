import {Component, Input, Output, OnInit, EventEmitter, HostListener} from '@angular/core';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
  @Output() selected_status = new EventEmitter();
  @Input() status_name: string;
  @Input() status_color: string;
  @Input() status_count: number;
  @Input() status_id: number;
  selected = false;
  constructor() { }

  ngOnInit() {}
  @HostListener('click', ['$event'])
  click() {
    this.selected = !this.selected;
    this.selected_status.emit({'status_id': this.status_id, 'is_selected?': this.selected});
  }
}
