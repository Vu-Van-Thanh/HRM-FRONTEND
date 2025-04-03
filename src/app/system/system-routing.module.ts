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
    path: 'employee',
    loadChildren: () => import('../pages/employee/employee.module').then(m => m.EmployeeModule)
  },
  {
    path: 'activity',
    loadChildren: () => import('../pages/activity/activity.module').then(m => m.ActivityModule)
  },
  {
    path: 'internal-info',
    loadChildren: () => import('../pages/internal-info/internal-info.module').then(m => m.InternalInfoModule)
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