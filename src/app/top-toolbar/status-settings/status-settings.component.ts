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
  mode: 'editing' | 'creating' | 'list_show' | 'empty' | 'loading' = 'loading';
  statuses;
  selected;
  status_form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(40)]),
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
    this.mode = 'loading';
    this.ApiService.get_not_blocked_statuses().then(res => {
      this.statuses = res;
      this.mode = 'list_show';
      this.empty_statuses_list()
    });
  }

  edit(status) {
    this.name.setValue(status.name);
    this.color.setValue(status.color);
    this.mode = 'editing';
    this.selected = status;
  }

  async save() {
    if (this.mode == 'editing') {
      this.ApiService.update_status(this.selected.id, this.name.value, this.color.value).then(res => {
        this.selected.name = res.name;
        this.selected.color = res.color;
        this.mode = 'list_show';
      });
    } else {
      const a = await this.ApiService.status_new(this.name.value, this.color.value);
      this.statuses.push( a);
      this.mode = 'list_show';
      this.empty_statuses_list()
    }
    this.reset_form()
  }

  delete_status() {
    if (confirm('A u shuare?')) {
      this.ApiService.block_status(this.selected.id).then(res => {
        this.statuses = this.statuses.filter(status => status.id !== res['id']);
        this.mode = 'list_show';
        this.selected = null;
        this.empty_statuses_list();
        this.status_form.reset()
      });
    }
  }

  empty_statuses_list() {
    if (!this.statuses.length) {
      this.mode = 'empty'
    }
  }

  reset_form() {
    this.status_form.reset();
  }

  back_to_show_all() {
    this.reset_form();
    this.mode = 'list_show';
  }

  getStyles(object) {
    return {'border-left': '7px solid ' + object.color};
  }
}
