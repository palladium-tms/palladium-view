import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../services/http-request.service';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {NgForm} from '@angular/forms';
import {Case} from '../models/case';

declare var $: any;

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {
  cases: Case[] = [];
  selected_counter = [];
  statuses;
  statuses_array;
  selected_status_id: number;
  case_settings_data = {};

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,
              private ApiService: PalladiumApiService, private router: Router, private _eref: ElementRef) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.ApiService.get_statuses().then(res => {
        this.statuses = JSON.parse(JSON.stringify(res));
        this.statuses_array = Object.keys(this.statuses);
        this.statuses['0'] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      });
      this.get_cases(params.id);
    });
  }
  get_cases(id) {
    this.ApiService.get_cases(id).then(cases => {
      this.cases = cases;
    });
  }
  selectCounter(current_case) {
    if (this.selected_counter.indexOf(current_case.id) === -1) {
      this.selected_counter.push(current_case.id);
    } else {
      const index = this.selected_counter.indexOf(current_case.id);
      this.selected_counter.splice(index, 1);
    }
    this.add_result_button(this.selected_counter.length === 0);
  }

  add_result_button(disable: boolean) {
    if (disable) {
      $('.add-result-block').addClass('disabled');
    } else {
      $('.add-result-block').removeClass('disabled');
    }
  }

  // selected_status_get(selected_id) {
  //   this.selected_status_id = selected_id;
  // }
  //
  // add_result_modal(modal) {
  //   if (this.selected_counter.length !== 0) {
  //     modal.open();
  //   }
  // }
  show_settings_button(index) {
    $('#' + index + '.case-setting-button').show();
  };

  hide_settings_button(index) {
    $('#' + index + '.case-setting-button').hide();
  };

  edit_case(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    this.ApiService.edit_case(this.case_settings_data['id'], form.value['case_name']).then(
      this_case => {
          this.cases[this.case_settings_data['index']].name = this_case.name;
          this.cases[this.case_settings_data['index']].updated_at = this_case.updated_at;
        }
    );
    modal.close();
  }

  delete_case(casesettingsModal) {
    if (confirm('A u shuare?')) {
      this.ApiService.delete_case(this.case_settings_data['id']).then(res => {
        this.cases.splice(this.case_settings_data['index'], 1);
      });
      casesettingsModal.close();
    }
  }
  settings(modal, this_case, index, form) {
    this.case_settings_data = {id: this_case.id, index: index};
    modal.open();
    form.controls['case_name'].setValue(this_case.name);
  }
}
