import {Component, OnInit, ViewChild} from '@angular/core';
const { version: appVersion } = require('../../../../package.json');

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  appVersion;
  @ViewChild('Modal') Modal;

  constructor() { }

  ngOnInit() {
    this.appVersion = appVersion;
  }

  open() {
    this.Modal.open();
  }
}
