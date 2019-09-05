import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import {MatDialog} from '@angular/material';
import {ResultSetsSettingsComponent} from '../result-sets/result-sets.component';
import {StatisticService} from '../../services/statistic.service';
import {Statistic} from '../models/statistic';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CasesComponent implements OnInit {
  cases = [];
  statuses;
  object;
  suiteId;
  loading = false;
  dropdownMenuItemSelect;

  constructor(private activatedRoute: ActivatedRoute,
              private palladiumApiService: PalladiumApiService, private router: Router,
              private dialog: MatDialog, public stat: StatisticService,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.suiteId = params.id;
      this.get_cases();
    });
  }

  get_cases() {
    this.loading = true;
    this.palladiumApiService.get_cases(this.suiteId).then(cases => {
      this.cases = cases;
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  update_click() {
    this.get_cases();
  }

  copy_name() {
    const txtArea = document.createElement('textarea');
    txtArea.id = 'txt';
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = this.dropdownMenuItemSelect.name;
    document.body.appendChild(txtArea);
    txtArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        return true;
      }
    } catch (err) {
    } finally {
      document.body.removeChild(txtArea);
    }
    return false;
  }

  open_settings() {
    const dialogRef = this.dialog.open(ResultSetsSettingsComponent, {
      data: {
        object: this.dropdownMenuItemSelect,
        cases: this.cases
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cases = this.cases.filter(obj => (obj.id !== result.id));
        this.router.navigate([/\S*suite\/(\d+)/.exec(this.router.url)[0]], {relativeTo: this.activatedRoute});
        this.update_statistic();
      }
      this.cd.detectChanges();
    });
  }

  update_statistic() {
    const statData = {};
    this.cases.forEach(object => {
      if (object['status'] in statData) {
        statData[object['status']] += 1;
      } else {
        statData[object['status']] = 1;
      }
    });
    // this.stat.update_parant_statistic(new Statistic(statData));
  }
}
