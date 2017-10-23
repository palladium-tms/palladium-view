import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
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
  @Output() result_object = new EventEmitter();
  settings_visibility = false;
  settings_data;
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
  show_settings_button() {
    this.settings_visibility = true;
  }
  hide_settings_button() {
    this.settings_visibility = false;
  }
  settings(modal, form) {
    this.settings_data = {object: this.object, id: this.object};
    modal.open();
    form.controls['suite_name'].setValue(this.object.name);
  }
  edit_suite(form, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    this.ApiService.edit_suite(this.object.id, form.value['suite_name']).then(suite => {
      this.object.name = suite.name;
      this.object.updated_at = suite.updated_at;
      this.result_object.emit({status: 'run_update', index: this.index, object: this.object });
    });
    modal.close();
  }
  delete_suite(modal) {
    if (confirm('A u shuare?')) {
      this.result_object.emit({status: 'suite_deleted', index: this.index, object: this.object });
      this.ApiService.delete_suite(this.object.id).then(suite => {
        console.log(suite);
      });
      modal.close();
      if (this.router.url.indexOf('/suite/' + this.object.id) >= 0) {
        this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]]);
      }
    }
  }
  select_suite() {
    if (this.router.url.indexOf('/suite/' + this.object.id) > 0 ) {
      this.router.navigate([/(.*?)(?=suite|$)/.exec(this.router.url)[0]], true);
    }
    this.isSelected = true;
  }
}
