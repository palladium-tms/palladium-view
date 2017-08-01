// Main component. Its begin of app
import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, AfterViewInit {
  container;

  constructor() { }

  ngOnInit() {}
  ngAfterViewInit() {
    this.container = $('#main-container');
    this.container.css('height', this.container.innerHeight() - 48);
  }
  onResize(event) {
    this.container.css('height', event.target.innerHeight - 65);
  }
}
