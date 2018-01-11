import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {PalladiumApiService} from '../../../services/palladium-api.service';

@Component({
  selector: 'app-suite',
  templateUrl: './suite.component.html',
  styleUrls: ['./suite.component.css']
})
export class SuiteComponent implements OnInit {
  @Input() object;
  @Input() index;
  @Input() statuses;
  @Output() replace_to_run = new EventEmitter();
  isSelected = false;

  constructor(private router: Router, private ApiService: PalladiumApiService) { }

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

  create_run_by_suite(suite) {
    this.ApiService.create_run(suite.name, this.router.url.match(/plan\/(\d+)/i)[1]).then(res => {
      this.replace_to_run.emit([suite, res]);
    });
  }
}
