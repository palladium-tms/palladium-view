import {Component, Input, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-suite',
  templateUrl: './suite.component.html',
  styleUrls: ['./suite.component.css']
})
export class SuiteComponent implements OnInit {
  @Input() object;
  @Input() index;
  @Input() statuses;
  settings_visibility = false;
  settings_data;
  isSelected = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.isSelected = this.is_selected_element(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isSelected = (this.is_selected_element(event.url));
      }
    });
  }

  is_selected_element(url) {
    if (url.match(/suite\/(\d+)/i) !== null) {
      return(this.router.url.match(/suite\/(\d+)/i)[1] === (this.object.id + ''));
    } else {
      return false;
    }
  }
  settings(modal, form) {
    this.settings_data = {object: this.object, id: this.object};
    modal.open();
    form.controls['suite_name'].setValue(this.object.name);
  }
  select_suite() {
    if (this.router.url.indexOf('/suite/' + this.object.id) > 0 ) {
      this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]], true);
    }
    this.isSelected = true;
  }
}
