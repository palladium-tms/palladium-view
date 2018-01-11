import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {
  cases = [];
  @ViewChild('form') form;
  @ViewChild('Modal') Modal;
  statuses;
  object;
  menuItems = [
    {label: '<span class="menu-icon">Refresh</span>', onClick: this.get_cases.bind(this)},
    {label: '<span class="menu-icon">Edit</span>', onClick: this.open_modal.bind(this)},
    {label: '<span class="menu-icon">Delete</span>', onClick: this.delete_case.bind(this)}];

  constructor(private activatedRoute: ActivatedRoute,
              private ApiService: PalladiumApiService, private router: Router) {
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

  edit_case_modal() {
    if (!this.form.valid) {
      return;
    }
    this.ApiService.edit_case(this.object.id, this.form.value['name']).then(
      this_case => {
        const result_set_for_change = this.cases.filter(current_case => current_case.id === this.object.id)[0];
        result_set_for_change.name = this_case.name;
        result_set_for_change.updated_at = this_case.updated_at;
        }
    );
    this.Modal.close();
  }

  delete_case(data) {
      this.ApiService.delete_case(data['dataContext'].id).then(this_case => {
        this.cases = this.cases.filter(current_case => current_case.id !== this_case.id)[0];
      });
  }

  update_click() {
    this.cases = [];
    this.get_cases();
  }
}
