import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SystemRoutingModule } from './system-routing.module';
import { DepartmentComponent } from './department/department.component';
import { SalaryModule } from './salary/salary.module';

@NgModule({
  declarations: [
    DepartmentComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SystemRoutingModule,
    SalaryModule
  ]
})
export class SystemModule { } 