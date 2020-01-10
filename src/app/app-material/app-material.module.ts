import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {SortByCreatedAtPipe} from '../pipes/sort-by-created-at/sort-by-created-at.pipe';
import {StatusFilterPipe} from 'app/pipes/status_filter_pipe/status-filter.pipe';
import {StatusFilterComponent} from '../page-component/status-filter/status-filter.component';
import {StatusFilterBarComponent} from '../page-component/status-filter-bar/status-filter-bar.component';
import {StatisticFilterPipe} from '../pipes/statistic-filter/statistic-filter.pipe';
import {VirtualscrollPipe} from '../pipes/virtual-scroll/virtualscroll.pipe';
import {SearchPipe} from '../pipes/search/search.pipe';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ResultValueComponent} from 'app/page-component/result-value/result-value.component';
import {SortByUpdatedAtPipe} from '../pipes/sort-by-created-at/sort-by-updated-at.pipe';
import {SelectedElementPipe} from '../pipes/selected-element/selected-element.pipe';

@NgModule({
  declarations: [SortByUpdatedAtPipe,
    SelectedElementPipe,
    SortByCreatedAtPipe,
    StatusFilterPipe,
    StatusFilterComponent, StatusFilterBarComponent, StatisticFilterPipe, VirtualscrollPipe, SearchPipe, ResultValueComponent],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    StatusFilterComponent,
    StatusFilterBarComponent,
    ResultValueComponent,
    SortByCreatedAtPipe,
    StatusFilterPipe,
    StatisticFilterPipe,
    VirtualscrollPipe,
    SortByUpdatedAtPipe,
    SearchPipe,
    SelectedElementPipe,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class AppMaterialModule { }
