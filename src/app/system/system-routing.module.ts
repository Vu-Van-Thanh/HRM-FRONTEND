import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentComponent } from './department/department.component';
import { SalaryListComponent } from './salary/salary-list/salary-list.component';

const routes: Routes = [
  {
    path: 'department',
    component: DepartmentComponent
  },
  {
    path: 'salary',
    component: SalaryListComponent
  },
  {
    path: '',
    redirectTo: 'department',
    pathMatch: 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule { } 