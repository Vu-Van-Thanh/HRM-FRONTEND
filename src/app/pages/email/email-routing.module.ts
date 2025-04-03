import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InboxComponent } from './inbox/inbox.component';
import { EmailreadComponent } from './emailread/emailread.component';
import { BasicComponent } from './basic/basic.component';
import { BillingComponent } from './billing/billing.component';
import { AlertComponent } from './alert/alert.component';
import { GenerateComponent } from './generate/generate.component';

const routes: Routes = [
    {
        path: 'inbox',
        component: InboxComponent
    },
    {
        path: 'read/:id',
        component: EmailreadComponent
    },
    {
        path: 'basic',
        component: BasicComponent
    },
    {
        path: 'billing',
        component: BillingComponent
    },
    {
        path: 'alert',
        component: AlertComponent
    },
    {
        path: 'generate',
        component: GenerateComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmailRoutingModule {}
