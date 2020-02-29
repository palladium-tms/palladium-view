import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';

@Component({
  selector: 'app-detail-result',
  templateUrl: './detail-result.component.html',
  styleUrls: ['./detail-result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailResultComponent implements OnInit {
  statuses;
  result_id;
  result;
  status;

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
      this.status = this.statuses.find(status => status.id === this.result.status_id);
    });
  }

  get_statuses() {
    return this.ApiService.get_statuses();
  }

  get_result() {
    // return this.ApiService.get_result(this.result_id).then(result => {
    //   return result;
    // });
  }
  getStyles() {
      return {'border-right': '7px solid ' +  this.status.color};
  }
}
