import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivityService } from '../services/activity.service';
import { Activity, ActivityField, ActivityType } from '../models/activity.model';

@Component({
  selector: 'app-activity-form-dialog',
  templateUrl: './activity-form-dialog.component.html',
  styleUrls: ['./activity-form-dialog.component.scss']
})
export class ActivityFormDialogComponent implements OnInit {
  form: FormGroup;
  activityFields: ActivityField[] = [];
  isEdit: boolean = false;
  isView: boolean = false;
  activityType: string = '';
  record?: Activity;
  title: string = '';

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    public dialogRef: MatDialogRef<ActivityFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      activityType?: string;
      record?: Activity;
      isEdit?: boolean;
      isView?: boolean;
    }
  ) {
    this.isEdit = data.isEdit || false;
    this.isView = data.isView || false;
    this.activityType = data.activityType || '';
    this.record = data.record;
  }

  ngOnInit(): void {
    if (this.record) {
      this.activityType = this.record.activityType;
    }
    this.loadActivityFields();
    this.setActivityTypeTitle();
  }

  loadActivityFields(): void {
    this.activityService.getActivityFields(this.activityType).subscribe(fields => {
      this.activityFields = fields;
      this.initForm();
    });
  }

  initForm(): void {
    const formGroup: any = {};
    
    this.activityFields.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      formGroup[field.name] = [this.record?.[field.name as keyof Activity] || '', validators];
    });

    this.form = this.fb.group(formGroup);

    if (this.isView) {
      this.form.disable();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      
      if (this.isEdit && this.record) {
        this.activityService.updateActivityRecord(this.record.id, {
          ...formData,
          activityType: this.activityType as ActivityType
        }).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        // Mock user data - in real app, this would come from auth service
        const mockUser = {
          id: 1,
          name: 'Nguyễn Văn A',
          departmentId: 1,
          departmentName: 'Phòng Nhân sự'
        };

        this.activityService.createActivityRecord({
          employeeId: mockUser.id,
          employeeName: mockUser.name,
          departmentId: mockUser.departmentId,
          departmentName: mockUser.departmentName,
          activityType: this.activityType as ActivityType,
          ...formData
        }).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getActivityTypeLabel(type: string): string {
    switch (type) {
      case ActivityType.ATTENDANCE:
        return 'Chấm công';
      case ActivityType.REGISTRATION:
        return 'Đăng ký hoạt động';
      case ActivityType.OVERTIME:
        return 'Tăng ca';
      case ActivityType.BUSINESS_TRIP:
        return 'Đăng ký công tác';
      default:
        return '';
    }
  }

  setActivityTypeTitle(): void {
    switch (this.data.activityType) {
      case ActivityType.ATTENDANCE:
        this.title = 'Đăng ký chấm công';
        break;
      case ActivityType.REGISTRATION:
        this.title = 'Đăng ký hoạt động';
        break;
      case ActivityType.OVERTIME:
        this.title = 'Đăng ký tăng ca';
        break;
      case ActivityType.BUSINESS_TRIP:
        this.title = 'Đăng ký công tác';
        break;
    }
  }
} 