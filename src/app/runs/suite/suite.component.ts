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

  get_status_by_id(id) {
    return this.statuses.find(status => status.id === +id);
  }
}
