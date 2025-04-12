import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityDetailDialogComponent } from './activity-detail-dialog/activity-detail-dialog.component';
import { ActivityFormDialogComponent } from './activity-form-dialog/activity-form-dialog.component';
import { ActivityRegistrationComponent } from './activity-registration/activity-registration.component';
import { ActivityType } from './models/activity.model';

const routes: Routes = [
  {
    path: '',
    component: ActivityListComponent
  },
  {
    path: 'attendance',
    component: ActivityListComponent,
    data: { activityType: ActivityType.ATTENDANCE }
  },
  {
    path: 'leave',
    component: ActivityListComponent,
    data: { activityType: ActivityType.LEAVE }
  },
  {
    path: 'remote',
    component: ActivityListComponent,
    data: { activityType: ActivityType.REMOTE }
  },
  {
    path: 'register/:type',
    component: ActivityRegistrationComponent
  }
];

@NgModule({
  declarations: [
    ActivityListComponent,
    ActivityDetailDialogComponent,
    ActivityFormDialogComponent,
    ActivityRegistrationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatCardModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatTooltipModule
  ],
  exports: [RouterModule]
})
export class ActivityModule { } 