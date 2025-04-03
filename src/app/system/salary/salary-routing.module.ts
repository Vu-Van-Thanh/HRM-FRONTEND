import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalaryListComponent } from './salary-list/salary-list.component';
import { SalaryDetailComponent } from './salary-detail/salary-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SalaryListComponent
  },
  {
    path: ':id',
    component: SalaryDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalaryRoutingModule { } 