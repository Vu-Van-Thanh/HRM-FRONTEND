import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SalaryRoutingModule } from './salary-routing.module';
import { SalaryListComponent } from './salary-list/salary-list.component';
import { SalaryDetailComponent } from './salary-detail/salary-detail.component';

@NgModule({
  declarations: [
    SalaryListComponent,
    SalaryDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SalaryRoutingModule
  ],
  exports: [
    SalaryListComponent,
    SalaryDetailComponent
  ]
})
export class SalaryModule { } 