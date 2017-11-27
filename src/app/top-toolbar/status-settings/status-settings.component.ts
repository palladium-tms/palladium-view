import {Component, OnInit, ViewChild} from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';
import {Status} from '../../models/status';

@Component({
  selector: 'app-status-settings',
  templateUrl: './status-settings.component.html',
  styleUrls: ['./status-settings.component.css']
})
export class StatusSettingsComponent implements OnInit {
  @ViewChild('form') form;
  @ViewChild('creating_form') creating_form;
  statuses;
  selected;
  mode = 'empty';
  constructor(private ApiService: PalladiumApiService) { }

  ngOnInit() {}
  status_settings(modal) {
    modal.open();
    this.ApiService.get_not_blocked_statuses().then(res => {
      this.statuses = res;
    });
  }
  delete_status() {
    if (confirm('A u shuare?')) {
      this.ApiService.block_status(this.selected.id).then(res => {
        this.statuses = this.statuses.filter(status => status.id !== res['id']);
        this.selected = null;
        this.mode = 'empty';
      });
    }
  }
  update_status() {
    const name = this.form.value['status_name'];
    const color = this.form.value['status_color'];
    this.ApiService.update_status(this.selected.id, name, color).then(res => {
      this.selected.name = res.name;
      this.selected.color = res.color;
    });
  }
  getStyles(object) {
      return {'border-left': '7px solid ' + object.color};
  }
  status_new() {
    const name = this.creating_form.value['status_name'];
    const color = this.creating_form.value['status_color'];
    this.ApiService.status_new(name, color).then( status => {
      this.statuses.push(new Status(status));
      this.selected = this.statuses.filter(st => st.id === status.id)[0];
      this.item_selected(this.statuses.filter(st => st.id === status.id)[0]);
    });
  }
  new_status_create() {
    this.selected = null;
    this.mode = 'creating';
  }

  item_selected(object) {
    this.mode = 'editing';
    this.selected = object;
    this.form.controls['status_name'].setValue(object.name);
    this.form.controls['status_color'].setValue(object.color);
  }
}
