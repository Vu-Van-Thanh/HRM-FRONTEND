import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PagetitleComponent } from './pagetitle/pagetitle.component';
import { LoaderComponent } from './loader/loader.component';
import { LoadingComponent } from './loading/loading.component';
import { AssignedUserSelectComponent } from './assigned-user-select/assigned-user-select.component';
@NgModule({
  declarations: [PagetitleComponent,  LoaderComponent, LoadingComponent, AssignedUserSelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  exports: [PagetitleComponent, LoaderComponent, LoadingComponent,AssignedUserSelectComponent]
})
export class UIModule { }
