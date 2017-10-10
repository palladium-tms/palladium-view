import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {
  @Input() all_data = [];
  @Input() statuses;
  all_statistic = {};

  constructor() { }

  ngOnInit() {
    console.log(this.all_data);
    console.log(this.statuses);
    this.calculate_statistis();
  }
  calculate_statistis() {
    this.all_data.forEach(object => {
      object.statistic.existed_statuses.forEach( status_id => {
        console.log(Object.keys(this.all_statistic).filter(stat => stat === status_id).length === 0);
        if (Object.keys(this.all_statistic).filter(stat => stat === status_id).length === 0) {
          this.all_statistic[status_id] = 1;
        }
        console.log(object.statistic.existed_statuses);
      });
      console.log(this.all_statistic);
    });
  }

}
