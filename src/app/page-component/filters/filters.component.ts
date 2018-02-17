import {
  Component, Input, Output, EventEmitter, OnChanges
} from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnChanges {

  @Input() statuses;
  @Input() statistic;
  @Output() selected_statuses_emmit = new EventEmitter();
  all_statistic = {};
  existed_statuses = [];

  constructor() {
  }

  ngOnChanges() {
    if (this.statuses && this.statistic) {
      this.existed_statuses = this.statistic.existed_statuses;
      this.all_statistic = this.statistic.extended;
    }
  }

  hide_element(element, status) {
    if (element) {
      return !(element.extended[status.id] || status.active);
    }
    return true;
  }

  select_filter(filter) {
    filter.active = !filter.active;
    this.selected_statuses_emmit.emit(this.statuses);
  }
}
