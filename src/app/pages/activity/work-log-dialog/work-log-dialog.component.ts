import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '../models/project.model';
import { Position } from '../models/position.model';

@Component({
  selector: 'app-work-log-dialog',
  templateUrl: './work-log-dialog.component.html',
  styleUrls: ['./work-log-dialog.component.scss']
})
export class WorkLogDialogComponent {
  workLogForm: FormGroup;
  projects: Project[] = [];
  positions: Position[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.projects = data.projects;
    this.positions = data.positions;
    this.initForm();
  }

  private initForm(): void {
    this.workLogForm = this.fb.group({
      projectId: ['', Validators.required],
      positionId: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date(), Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.workLogForm.valid) {
      this.dialogRef.close(this.workLogForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 