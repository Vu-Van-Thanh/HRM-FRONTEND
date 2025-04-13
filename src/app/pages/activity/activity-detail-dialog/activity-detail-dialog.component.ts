import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-activity-detail-dialog',
  templateUrl: './activity-detail-dialog.component.html',
  styleUrls: ['./activity-detail-dialog.component.scss']
})
export class ActivityDetailDialogComponent implements OnInit {
  activity: Activity;
  isReject: boolean = false;
  rejectForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ActivityDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { activity: Activity, isReject?: boolean },
    private fb: FormBuilder
  ) {
    this.activity = data.activity;
    this.isReject = data.isReject || false;

    if (this.isReject) {
      this.rejectForm = this.fb.group({
        reason: ['', Validators.required]
      });
    }
  }

  ngOnInit(): void {
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isReject && this.rejectForm.valid) {
      this.dialogRef.close({
        reason: this.rejectForm.get('reason')?.value
      });
    }
  }
} 