import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PalladiumApiService, StructuredStatuses } from '../../../services/palladium-api.service';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-status-settings',
  templateUrl: './status-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSettingsComponent {
  constructor(private dialog: MatDialog) { }

  open() {
    this.dialog.open(StatusSettingsDialogComponent);
  }
}

@Component({
  selector: 'app-status-dialog-settings',
  templateUrl: './status-settings-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSettingsDialogComponent implements OnInit, OnDestroy {
  mode: 'editing' | 'creating' | 'list_show' | 'empty' = 'list_show';
  statuses;
  selected;
  statuses$: Observable<StructuredStatuses>;

  statusForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    color: new FormControl('', [Validators.required])
  });

  constructor(private palladiumApiService: PalladiumApiService, private cd: ChangeDetectorRef) { }

  get name() {
    return this.statusForm.get('name');
  }

  get color() {
    return this.statusForm.get('color');
  }

  ngOnInit() {
    this.statuses$ = this.palladiumApiService.statuses$.pipe(map(statuses => {
      if (statuses === {}) {
        this.mode = 'empty';
      }
      return Object.values(statuses).filter(status => !status.block);
    }));
  }

  edit(status) {
    this.name.setValue(status.name);
    this.color.setValue(status.color);
    this.mode = 'editing';
    this.selected = status;
    this.cd.detectChanges();
  }

  save() {
    if (this.mode === 'editing') {
      this.palladiumApiService.update_status(this.selected.id, this.name.value, this.color.value);
    } else {
      this.palladiumApiService.status_new(this.name.value, this.color.value);
    }
    this.mode = 'list_show';
  }

  delete_status() {
    if (confirm('A u shuare?')) {
      this.palladiumApiService.block_status(this.selected.id);
      this.mode = 'list_show';
    }
  }

  reset_form() {
    this.statusForm.reset();
  }

  back_to_show_all() {
    this.reset_form();
    this.mode = 'list_show';
  }

  getStyles(object) {
    return { 'border-left': '7px solid ' + object.color };
  }

  ngOnDestroy(): void {
    this.cd.detach();
  }
}
