import {Component, OnInit, ViewChild} from '@angular/core';
import {PalladiumApiService} from '../../../services/palladium-api.service';
import {Status} from '../../models/status';
import {MatDialog} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-status-settings',
  templateUrl: './status-settings.component.html',
})
export class StatusSettingsComponent {
  constructor(private dialog: MatDialog) {}

  open() {
    this.dialog.open(StatusSettingsDialogComponent);
  }
}


@Component({
  selector: 'app-status-dialog-settings',
  templateUrl: './status-settings-dialog.component.html',
})
export class StatusSettingsDialogComponent implements OnInit {
  statuses;
  editing = false;
  selected;
  status_form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    color: new FormControl('', [Validators.required])
  });

  constructor(private ApiService: PalladiumApiService) {
  }

  get name() {
    return this.status_form.get('name');
  }

  get color() {
    return this.status_form.get('color');
  }

  async ngOnInit() {
    this.ApiService.get_not_blocked_statuses().then(res => {
      this.statuses = res;
    });
  }

  edit(status) {
    this.name.setValue(status.name);
    this.color.setValue(status.color);
    this.editing = true;
    this.selected = status;
  }

  save() {
    this.ApiService.update_status(this.selected.id, this.name.value, this.color.value).then(res => {
      this.selected.name = res.name;
      this.selected.color = res.color;
      this.editing = false;
    });
  }

  delete_status() {
    if (confirm('A u shuare?')) {
      this.ApiService.block_status(this.selected.id).then(res => {
        this.statuses = this.statuses.filter(status => status.id !== res['id']);
        this.editing = false;
        this.selected = null;
      });
    }
  }

  getStyles(object) {
    return {'border-left': '7px solid ' + object.color};
  }
}
