import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
const { version: appVersion } = require('../../../../package.json');

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {

  constructor(private dialog: MatDialog) {}

  open() {
    this.dialog.open(AboutDialogComponent);
  }
}

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about.dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutDialogComponent implements OnInit  {
  version;

  ngOnInit() {
    this.version = appVersion;
  }
}
