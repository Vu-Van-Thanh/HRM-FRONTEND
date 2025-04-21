import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { SalaryComponent } from './salary/salary.component';
import { ContractComponent } from './contract/contract.component';
import { NewsComponent } from './news/news.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeListComponent
  },
  {
    path: 'personal-info',
    component: PersonalInfoComponent
  },
  {
    path: 'profile',
    component: PersonalInfoComponent
  },
  {
    path: 'salary',
    component: SalaryComponent
  },
  {
    path: 'contract',
    component: ContractComponent
  },
  {
    path: 'news',
    component: NewsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { } 