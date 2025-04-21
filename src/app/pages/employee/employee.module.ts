import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { MatRippleModule } from '@angular/material/core';
import { MatTableExporterModule } from 'mat-table-exporter';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';

import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeDetailDialogComponent } from './employee-detail-dialog/employee-detail-dialog.component';
import { EmployeeRoutingModule } from './employee-routing.module';
import { ContractDialogComponent } from './contract-dialog/contract-dialog.component';
import { RelativeDialogComponent } from './relative-dialog/relative-dialog.component';
import { EmployeeService } from './employee.service';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { SalaryComponent } from './salary/salary.component';
import { ContractComponent } from './contract/contract.component';
import { NewsComponent } from './news/news.component';

@NgModule({
  declarations: [
    EmployeeListComponent,
    EmployeeDetailDialogComponent,
    ContractDialogComponent,
    RelativeDialogComponent,
    PersonalInfoComponent,
    SalaryComponent,
    ContractComponent,
    NewsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatStepperModule,
    MatDividerModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatGridListModule,
    MatProgressBarModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTreeModule,
    MatRippleModule,
    MatTableExporterModule,
    NgbModule,
    NgChartsModule,
    EmployeeRoutingModule
  ],
  providers: [EmployeeService],
  exports: [
    EmployeeListComponent
  ]
})
export class EmployeeModule { } 