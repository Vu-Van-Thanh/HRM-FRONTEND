import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Activity } from '../models/activity.model';
import { ActivityService } from '../services/activity.service';

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
    private activityService: ActivityService,
    private fb: FormBuilder
  ) {
    this.activity = data.activity;
    this.isReject = data.isReject || false;
  }

  ngOnInit(): void {
    if (this.isReject) {
      this.initRejectForm();
    }
  }

  initRejectForm(): void {
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onReject(): void {
    if (this.rejectForm.valid) {
      this.activityService.rejectActivity(this.activity.id, this.rejectForm.get('reason').value)
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error rejecting activity:', error);
          }
        });
    }
  }
} 