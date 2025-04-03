import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InternalInfoListComponent } from './internal-info-list/internal-info-list.component';
import { InternalInfoFormDialogComponent } from './internal-info-form-dialog/internal-info-form-dialog.component';
import { WordContentViewerComponent } from './word-content-viewer/word-content-viewer.component';
import { WordDocumentDialogComponent } from './word-document-dialog/word-document-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: InternalInfoListComponent
  }
];

@NgModule({
  declarations: [
    InternalInfoListComponent,
    InternalInfoFormDialogComponent,
    WordContentViewerComponent,
    WordDocumentDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressBarModule
  ]
})
export class InternalInfoModule { } 