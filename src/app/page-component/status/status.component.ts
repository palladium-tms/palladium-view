import {Component, Input, Output, OnInit, EventEmitter, HostListener, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
  @Output() selected_status = new EventEmitter();
  @Input() status_name: string;
  @Input() status_color: string;
  @Input() status_count: number;
  @Input() status_id: number;
  selected = false;
  constructor(private  activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      let filter;
      filter = params['filter'];
      if (!(filter instanceof Array)) {
        filter = [filter];
      }
        if (filter) {
        if (filter.filter(id => +id === this.status_id).length !== 0) {
          this.selected = true;
        } else {
          this.selected = false;
        }
      }
    });
  }
  @HostListener('click', ['$event'])
  click() {
    this.selected = !this.selected;
    this.selected_status.emit({'status_id': this.status_id, 'is_selected?': this.selected});
  }
}
