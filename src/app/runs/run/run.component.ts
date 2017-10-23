import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {PalladiumApiService} from '../../../services/palladium-api.service';
import {ActivatedRoute} from '@angular/router';

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
  @Output() result_object = new EventEmitter();
  settings_visibility = false;
  settings_data;
  isSelected = false;
  constructor(private router: Router, private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute) {
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

  show_settings_button() {
    this.settings_visibility = true;

  }

  hide_settings_button() {
    this.settings_visibility = false;
  }

  force_floor(data) {
    return (Math.floor(data * 100) / 100);
  }

  settings(modal, form) {
    this.settings_data = {object: this.object, id: this.object};
    modal.open();
    form.controls['run_name'].setValue(this.object.name);
  }

  delete_object(modal) {
    if (confirm('A u shuare?')) {
      this.result_object.emit({status: 'run_deleted', index: this.index, object: this.object});
      this.ApiService.delete_run(this.object.id).then(run => {
        console.log(run);
      });
      modal.close();
      if (this.router.url.indexOf('/run/' + this.object.id) >= 0) {
        this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]]);
      }
    }
  }

  edit_run(form, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    this.ApiService.edit_suite_by_run_id(this.object.id, form.value['run_name']).then(suite => {
      this.object.name = form.value['run_name'];
      this.object.updated_at = suite.updated_at;
      this.result_object.emit({status: 'run_update', index: this.index, object: this.object});
    });
    modal.close();
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
      this.router.navigate([/(.*?)(?=run|$)/.exec(this.router.url)[0]], true);
    }
    this.isSelected = true;
  }
}
