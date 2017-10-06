import {Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewEncapsulation} from '@angular/core';
import {Status} from '../../../models/status';
@Component({
  selector: 'app-status-selector',
  templateUrl: './status-selector.component.html',
  styleUrls: ['./status-selector.component.css'],
  encapsulation: ViewEncapsulation.None  // Enable dynamic HTML styles
})
export class StatusSelectorComponent implements OnInit, OnChanges {
  @Input() all_statuses: Status[];
  @Output() selected_status = new EventEmitter<string>();

  private value: any = {};
  private _disabledV = '0';
  private disabled = false;
  private active_element = [];
  private items: Array<any> = [];

  public ngOnInit(): any {
    Object.keys(this.all_statuses).forEach(status => {
      this.items.push({
        id: status,
        text: `<colorbox style='background-color:${this.all_statuses[status]['color']};'></colorbox>${this.all_statuses[status]['name']}`
      });
    });
  }

  public ngOnChanges() {
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
    return (this.active_element !== undefined);
  }

  public set_status(id) {
    console.log(this.all_statuses);
    console.log(id);
    if (this.all_statuses[id]) {
      this.active_element = [{
        id: id,
        text: `<colorbox style='background-color:${this.all_statuses[id]['color']};'></colorbox>${this.all_statuses[id]['name']}`
      }];
    }
  }
}
