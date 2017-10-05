import { Injectable } from '@angular/core';

@Injectable()
export class LocalSettingsService {

  constructor() { }

  set_suites_visibility(id) {
    localStorage.setItem('suites_visibility', JSON.stringify([id]));
  };
  remove_suites_visibility(id) {
    const suites_visibility = JSON.parse(localStorage.getItem('suites_visibility'));
    suites_visibility.splice(suites_visibility.indexOf(id), 1);
    localStorage.setItem('suites_visibility', suites_visibility);
  }
}
