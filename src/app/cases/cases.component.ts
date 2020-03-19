import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PalladiumApiService} from '../../services/palladium-api.service';
import { MatDialog } from '@angular/material/dialog';
import {ResultSetsSettingsComponent} from '../result-sets/result-sets.component';
import {StatisticService} from '../../services/statistic.service';
import {ReplaySubject} from "rxjs";
import {StanceService} from "../../services/stance.service";
import {Case} from "../models/case";

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CasesComponent implements OnInit {
  cases$: ReplaySubject<(Case[])> = new ReplaySubject();
  statuses;
  object;
  loading = false;
  dropdownMenuItemSelect;

  constructor(private activatedRoute: ActivatedRoute,
              private palladiumApiService: PalladiumApiService, private router: Router,
              private dialog: MatDialog, public stat: StatisticService,
              private cd: ChangeDetectorRef, private stance: StanceService,) {
  }

  ngOnInit() {
    this.activatedRoute.params.pluck('id').map(id => +id).switchMap(id => {
      this.palladiumApiService.get_cases(id, this.stance.productId());
      return this.get_cases(id);
    }).subscribe();
  }

  get_cases(id) {
    return this.palladiumApiService.products$.switchMap(products => {
      const productId = this.stance.productId();
      return products.find(product => product.id === productId).suites$.map(suites => {
        suites.find(suite => suite.id === id).cases$.map(cases => {
          if (cases) {
            this.cases$.next(cases);
          }
        }).first().subscribe();
      });
    });
  }

  update_click() {
    this.get_cases(this.stance.suiteId());
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
