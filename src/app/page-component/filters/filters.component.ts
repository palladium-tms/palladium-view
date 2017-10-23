import {
  Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnChanges {

  @Input() all_data = [];
  @Input() statuses;
  @Input() statistic;
  @Output() selected_statuses_emmit = new EventEmitter();
  all_statistic = {};
  existed_statuses = [];
  selected_statuses = [];
  constructor() { }

  ngOnChanges() {
    if (this.all_data && this.statuses && this.statistic) {
      this.existed_statuses = this.statistic.existed_statuses;
      this.all_statistic = this.statistic.extended;
    }
  }

  selected_statuses_counter(status_data) {
    if (status_data['is_selected?']) {
      this.selected_statuses.push(status_data['status_id']);
    } else {
      this.selected_statuses = this.selected_statuses.filter(id => id !== status_data['status_id']);
    }
    this.selected_statuses_emmit.emit(this.selected_statuses);
  }
}
