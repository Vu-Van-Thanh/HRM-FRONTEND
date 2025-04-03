import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppVerticalComponent } from './vertical/vertical.component';
import { AppHorizontalComponent } from './horizontal/horizontal.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppVerticalComponent,
    AppHorizontalComponent,
    TopbarComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    AppVerticalComponent,
    AppHorizontalComponent
  ]
})
export class LayoutModule { } 