import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {MatDialog} from '@angular/material';
import {ResultSetsSettingsComponent} from '../result-sets/result-sets.component';
import {StatisticService} from '../../services/statistic.service';
import {Statistic} from '../models/statistic';

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
  suite_id;

  constructor(private activatedRoute: ActivatedRoute,
              private ApiService: PalladiumApiService, private router: Router, private dialog: MatDialog,  public stat: StatisticService) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.suite_id = params.id;
      this.get_cases();
    });
  }

  get_cases() {
      this.ApiService.get_cases(this.suite_id).then(cases => {
        this.cases = cases;
      });
  }
  open_settings() {
    const dialogRef = this.dialog.open(ResultSetsSettingsComponent, {
      data: {
        object: this.object,
        cases: this.cases
      }
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cases = this.cases.filter(obj => (obj.id !== result.id));
        this.router.navigate([/\S*suite\/(\d+)/.exec(this.router.url)[0]], {relativeTo: this.activatedRoute});
        this.update_statistic();
        // this.update_statistic();
      }
    });
  };

  update_statistic() {
    const stat_data = {};
    this.cases.forEach(object => {
      if (object['status'] in stat_data) {
        stat_data[object['status']] += 1;
      } else {
        stat_data[object['status']] = 1;
      }
    });
    this.stat.update_parant_statistic(new Statistic(stat_data));
  }
}
