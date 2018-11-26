import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
const { version: appVersion } = require('../../../../package.json');

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
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
})
export class AboutDialogComponent implements OnInit  {
  version;

  ngOnInit() {
    this.version = appVersion;
  }
}
