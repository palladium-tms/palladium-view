import { Component, OnInit } from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';
declare var $: any;

@Component({
  selector: 'app-status-settings',
  templateUrl: './status-settings.component.html',
  styleUrls: ['./status-settings.component.css']
})
export class StatusSettingsComponent implements OnInit {
  statuses;
  statuses_array;
  constructor(private ApiService: PalladiumApiService) { }

  ngOnInit() {
  }
  status_settings(modal) {
    modal.open();
    this.ApiService.get_not_blocked_statuses().then(res => {
      this.statuses = res;
      this.statuses_array = Object.keys(this.statuses);
    });
  }
  block_status(id) {
    this.ApiService.block_status(id).then(res => {
      this.statuses[res['status']['id'].toString()] = res;
      if (this.statuses[res['status']['id'].toString()]['status']['block']) {
        $('#' + id).hide();
      }
    });
  }
  change_color(id, color) {
    this.ApiService.color_status(id, color).then(res => {
      console.log(this.statuses[id]['color']);
      this.statuses[id]['color'] = res['status']['color'];
    });
  }
  getStylesBackround(id) {
    if (this.statuses) {
      return {'background': this.statuses[id].color };
    }
  }
}
