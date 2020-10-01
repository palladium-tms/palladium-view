import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PalladiumApiService } from '../../services/palladium-api.service';
import { MatDialog } from '@angular/material/dialog';
import { ResultSetsSettingsComponent } from '../result-sets/result-sets.component';
import { Observable } from "rxjs";
import { StanceService } from "../../services/stance.service";
import { Case } from "../models/case";
import { map, pluck } from 'rxjs/operators';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CasesComponent implements OnInit {
  cases$: Observable<(Case[])>;
  statuses;
  object;
  loading = false;
  dropdownMenuItemSelect;

  constructor(private activatedRoute: ActivatedRoute,
    private palladiumApiService: PalladiumApiService, private router: Router,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef, private stance: StanceService,) {
  }

  ngOnInit() {
    this.cases$ = this.palladiumApiService.cases$.pipe(map(cases => cases[this.stance.suiteId()]), map(x => { this.loading = false; return x; }));
    this.activatedRoute.params.pipe(pluck('id'), map(id => +id), map(id => {
      this.palladiumApiService.get_cases(id, this.stance.planId());
    })).subscribe();
  }

  get_cases() {
    this.loading = true;
    this.cd.markForCheck();
    this.palladiumApiService.get_cases(this.stance.suiteId(), this.stance.planId());
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
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate([/\S*suite\/(\d+)/.exec(this.router.url)[0]], { relativeTo: this.activatedRoute });
      }
      this.cd.detectChanges();
    });
  }
}
