import { Injectable } from '@angular/core';

@Injectable()
export class LocalSettingsService {
  inaccurately_deleting = true;
  constructor() { }
  inaccurately_deleting_option() {
    this.inaccurately_deleting = !this.inaccurately_deleting;
  }
}
