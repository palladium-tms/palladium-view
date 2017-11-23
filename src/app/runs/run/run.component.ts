import {Component, Input, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit {
  @Input() object;
  @Input() filter;
  @Input() index;
  @Input() statuses;
  isSelected = false;
  constructor(private router: Router) {
  }

  ngOnInit() {
    this.isSelected = this.is_selected_element(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isSelected = (this.is_selected_element(event.url));
      }
    });
  }

  is_selected_element(url) {
    if (url.match(/run\/(\d+)/i) !== null) {
      return (this.router.url.match(/run\/(\d+)/i)[1] === (this.object.id + ''));
    } else {
      return false;
    }
  }

  get_query() {
    if (this.filter.length === 0) {
      return '';
    } else {
      const unic = [];
      this.filter.forEach( status => {
        if (unic.indexOf(status) === -1) {
          unic.push(status);
        }
      });
      return {'filter': unic};
    }
  }

  select_run() {
    if (this.router.url.indexOf('/run/' + this.object.id) > 0) {
      this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
    }
    this.isSelected = true;
  }
}
