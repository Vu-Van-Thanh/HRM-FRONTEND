import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { Login2Component } from './login2/login2.component';

import { SignupComponent } from './signup/signup.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { Register2Component } from './register2/register2.component';
import { Recoverpwd2Component } from './recoverpwd2/recoverpwd2.component';
import { Page404Component } from 'src/app/extrapages/page404/page404.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Đăng nhập' }
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'signup-2',
        component: Register2Component
    },
    {
        path: 'reset-password',
        component: PasswordresetComponent
    },
    {
        path: 'recoverpwd-2',
        component: Recoverpwd2Component
    },
    {
        path: 'login-2',
        component: Login2Component
    },
    {
        path: 'change-password',
        component: ChangepasswordComponent
    },
    { path: '**', component: Page404Component },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }

