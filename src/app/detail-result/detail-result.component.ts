import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-detail-result',
  templateUrl: './detail-result.component.html',
  styleUrls: ['./detail-result.component.css']
})
export class DetailResultComponent implements OnInit {
  statuses;
  result_id;
  result;

  constructor(private ApiService: PalladiumApiService, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.result_id = params.id;
      this.init_data();
    });
  }

  init_data() {
    Promise.all([this.get_statuses(), this.get_result()]).then(res => {
      this.statuses = res[0];
      this.result = res[1];
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses().then(res => {
      this.statuses = res;
      res[0] = {name: 'Untested', color: '#ffffff', id: 0}; // add untested status. FIXME: need to added automaticly
      return res;
    });
  }

  get_result() {
    return this.ApiService.get_result(this.result_id).then(result => {
      return result;
    });
  }
  getStyles(id) {
    if (this.statuses) {
      return {'border-right': '7px solid ' + this.statuses[id].color};
    }
  }

}
