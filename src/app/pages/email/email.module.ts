import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { InboxComponent } from './inbox/inbox.component';
import { EmailreadComponent } from './emailread/emailread.component';
import { EmailRoutingModule } from './email-routing.module';
import { UIModule } from '../../shared/ui/ui.module';
import { BasicComponent } from './basic/basic.component';
import { BillingComponent } from './billing/billing.component';
import { AlertComponent } from './alert/alert.component';
import { GenerateComponent } from './generate/generate.component';

@NgModule({
  declarations: [
    InboxComponent, 
    EmailreadComponent, 
    BasicComponent, 
    BillingComponent, 
    AlertComponent,
    GenerateComponent
  ],
  imports: [
    CommonModule,
    UIModule,
    EmailRoutingModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    CKEditorModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class EmailModule { }
