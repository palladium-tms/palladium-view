import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../services/http-request.service';
import {PalladiumApiService} from '../../services/palladium-api.service';
import { Case } from '../models/case';
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
  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,
              private ApiService: PalladiumApiService, private router: Router, private _eref: ElementRef) { }

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

  selected_status_get(selected_id) {
    this.selected_status_id = selected_id;
  }

  add_result_modal(modal) {
    if (this.selected_counter.length !== 0) {
      modal.open();
    }
  }

}
