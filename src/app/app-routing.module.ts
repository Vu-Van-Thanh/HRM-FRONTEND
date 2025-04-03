import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layouts/layout.component';
import { CyptolandingComponent } from './cyptolanding/cyptolanding.component';
import { Page404Component } from './extrapages/page404/page404.component';
import { ErrorPageComponent } from './extrapages/errorpage/errorpage.component';

const routes: Routes = [
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { 
    path: '', 
    component: LayoutComponent, 
    children: [
      {
        path: 'employee',
        loadChildren: () => import('./pages/employee/employee.module').then(m => m.EmployeeModule)
      },
      {
        path: 'system',
        loadChildren: () => import('./system/system.module').then(m => m.SystemModule)
      },
      {
        path: 'pages',
        loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)
      },
      {
        path: '',
        loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
      }
    ],
    canActivate: [AuthGuard]
  },
  { path: 'crypto-ico-landing', component: CyptolandingComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: '**', component: Page404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
