import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';
import {Status} from '../../../models/status';
@Component({
  selector: 'app-status-selector',
  templateUrl: './status-selector.component.html',
  styleUrls: ['./status-selector.component.css'],
  encapsulation: ViewEncapsulation.None  // Enable dynamic HTML styles
})
export class StatusSelectorComponent implements OnInit, OnChanges {
  @Input() statuses: Status[];
  @Output() selected_status = new EventEmitter<string>();

  private value: any = {};
  private _disabledV = '0';
  private disabled = false;
  private active_element = [];
  private items: Array<any> = [];

  public ngOnInit(): any {
    Object.keys(this.statuses).forEach(status => {
      this.items.push({
        id: status,
        text: `<colorbox style='background-color:${this.statuses[status]['color']};'></colorbox>${this.statuses[status]['name']}`
      });
    });
  }

  public ngOnChanges() {
    // console.log('show_attention');
  }

  private get disabledV(): string {
    return this._disabledV;
  }

  private set disabledV(value: string) {
    this._disabledV = value;
    this.disabled = this._disabledV === '1';
  }
  public selected(value: any): void {
    // console.log('Selected value is: ', value);
    this.selected_status.emit(value.id);
  }

  public removed(value: any): void {
    this.selected_status.emit(null);
  }

  public typed(value: any): void {
    // console.log('New search input: ', value);
  }

  public refreshValue(value: any): void {
    this.value = value;
  }

  public clear_selected() {
    this.active_element = [];
  }

  public show_attention() {
    return(this.active_element !== undefined);
  }

  public set_status(id) {
    this.active_element = [{
      id: id,
      text: `<colorbox style='background-color:${this.statuses[id]['color']};'></colorbox>${this.statuses[id]['name']}`
    }];
  }
}
