import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
  @ViewChild('form') form;
  @ViewChild('Modal') Modal;
  selected_counter = [];
  statuses;
  object;
  statuses_array;
  selected_status_id: number;
  case_settings_data = {};
  menuItems = [
    {label: '<span class="menu-icon">Refresh</span>', onClick: this.get_cases.bind(this)},
    {label: '<span class="menu-icon">Edit</span>', onClick: this.open_modal.bind(this)},
    {label: '<span class="menu-icon">Delete</span>', onClick: this.delete_case.bind(this)}];

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,
              private ApiService: PalladiumApiService, private router: Router, private _eref: ElementRef) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.get_cases();
    });
  }
  get_cases() {
    const id = this.router.url.match(/suite\/(\d+)/i)[1];
    this.ApiService.get_cases(id).then(cases => {
      this.cases = cases;
    });
  }

  open_modal(object) {
    this.object = this.cases.filter(obj => obj.id === object.dataContext.id)[0];
    this.form.controls['name'].setValue(this.object.name);
    this.Modal.open();
  };

  edit_case(form: NgForm, modal, valid: boolean) {
    if (!valid) {
      return;
    }
    console.log(form);
    this.ApiService.edit_case(this.object.id, form.value['name']).then(
      this_case => {
        const result_set_for_change = this.result_sets.filter(result_set => result_set.id === this.object.id)[0];
        this.cases[this.case_settings_data['index']].name = this_case.name;
          this.cases[this.case_settings_data['index']].updated_at = this_case.updated_at;
        }
    );
    this.Modal.close();
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
