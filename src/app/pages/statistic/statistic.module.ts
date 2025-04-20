import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { HrStatisticsComponent } from './index';

@NgModule({
  declarations: [
    HrStatisticsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    NgbDropdownModule,
    NgbTooltipModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: 'dashboard',
        component: HrStatisticsComponent
      }
      
    ])
  ]
})
export class StatisticModule { } 