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
  @Output() selected_statuses_emmit = new EventEmitter();
  all_statistic = {};
  existed_statuses = [];
  selected_statuses = [];
  constructor() { }

  ngOnChanges() {
      this.all_statistic = {};
      this.calculate_statistis();
  }

  public calculate_statistis() {
    this.all_statistic = {};
    this.selected_statuses = [];
    this.all_data.forEach(object => {
      object.statistic.existed_statuses.forEach( status_id => {
        if (this.all_statistic[status_id]) {
          this.all_statistic[status_id] += object.statistic.extended[status_id];
        } else {
          this.all_statistic[status_id] = object.statistic.extended[status_id];
        }
      });
    });
    this.existed_statuses = Object.keys(this.all_statistic);
  }

  selected_statuses_counter(status_data) {
    if (status_data['is_selected?']) {
      this.selected_statuses.push(status_data['status_id']);
    } else {
      this.selected_statuses = this.selected_statuses.filter(id => id !== status_data['status_id']);
    }
    this.selected_statuses_emmit.emit( this.selected_statuses);
  }
}
