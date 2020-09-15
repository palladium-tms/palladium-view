import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {startWith, map} from 'rxjs/operators';
import * as moment from 'moment-timezone';
import {Observable} from 'rxjs';
import {PalladiumApiService} from '../../../services/palladium-api.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsComponent implements OnInit {

  timezoneForm: FormGroup = this._formBuilder.group({
    timezoneGroup: '',
  });
  timezoneGroupOptions$: Observable<string[]>;
  timezoneNames = [];
  currentTime = new Date();
  timezoneOffset;

  constructor(private _formBuilder: FormBuilder, private palladiumApiService: PalladiumApiService) {
    moment.tz.names().forEach(timezone => {
      this.timezoneNames.push(timezone + ': ' + moment.tz(timezone).format('Z'));
    });
  }

  async ngOnInit() {
    const userSettings = await this.palladiumApiService.get_user_setting();
    // if (userSettings) {
    //   this.timezoneForm.controls['timezoneGroup'].setValue(userSettings['timezone']);
    // }
    this.timezoneGroupOptions$ = this.timezoneForm.get('timezoneGroup')!.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          return this._filterGroup(value);
        })
      );
    this.timezoneGroupOptions$.subscribe(() => {
      const value = this.timezoneForm.controls['timezoneGroup'].value;
      if (value.match(new RegExp('([-+]).*'))) {
        this.timezoneOffset = value.match(new RegExp('([-+]).*'))[0];
      }
    });
  }

  private _filterGroup(value: string) {
    if (value) {
      value = value.toLowerCase().split(':')[0];
      return this.timezoneNames.filter(x => x.toLowerCase().match(new RegExp('^' + value + '|\/' + value)));
    }
    return this.timezoneNames;
  }

  edit_profile() {
    const timezone = this.timezoneForm.controls['timezoneGroup'].value;
    this.palladiumApiService.edit_user_setting(timezone);
  }
}
