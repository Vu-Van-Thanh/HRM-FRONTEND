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
  activityTypes: ActivityType[] = [];

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
    // Tải danh sách loại hoạt động từ API
    this.activityService.getActivityTypes().subscribe(types => {
      this.activityTypes = types;
      
      if (this.record) {
        // Set activityType từ activityId nếu chưa được thiết lập
        if (!this.record.activityType && this.record.activityId) {
          this.record.activityType = this.record.activityId;
        }
        
        this.activityType = this.record.activityType || '';
      }
      
      this.loadActivityFields();
      this.setActivityTypeTitle();
    });
  }

  loadActivityFields(): void {
    this.activityService.getActivityFields(this.activityType).subscribe(fields => {
      this.activityFields = fields;
      this.initForm();
    });
  }

  initForm(): void {
    const formGroup: any = {};
    
    // Parse requestFlds if it exists
    let requestFldsObj = {};
    if (this.record?.requestFlds) {
      try {
        requestFldsObj = JSON.parse(this.record.requestFlds);
      } catch (e) {
        console.error('Lỗi khi parse requestFlds:', e);
      }
    }
    
    this.activityFields.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      
      // Get field value from the record or from parsed requestFlds
      let fieldValue = '';
      if (field.name === 'reason' && this.record?.reason) {
        fieldValue = this.record.reason;
      } else if (field.name === 'taskName' && this.record?.taskName) {
        fieldValue = this.record.taskName;
      } else if (field.name === 'estimatedHours' && this.record?.estimatedHours) {
        fieldValue = this.record.estimatedHours.toString();
      } else if (field.name === 'startTime' && this.record?.startTime) {
        fieldValue = this.record.startTime;
      } else if (field.name === 'endTime' && this.record?.endTime) {
        fieldValue = this.record.endTime;
      } else if (requestFldsObj[field.name]) {
        fieldValue = requestFldsObj[field.name];
      } else if (field.name === 'location' && requestFldsObj['Location']) {
        fieldValue = requestFldsObj['Location'];
      } else if (field.name === 'estimatedHours' && requestFldsObj['EstimatedHours']) {
        fieldValue = requestFldsObj['EstimatedHours'];
      } else if (field.name === 'taskName' && requestFldsObj['TaskName']) {
        fieldValue = requestFldsObj['TaskName'];
      }
      
      formGroup[field.name] = [fieldValue, validators];
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
        this.activityService.updateActivityRecord(this.record.requestId, {
          ...formData,
          activityType: this.activityType
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
          employeeId: mockUser.id.toString(),
          employeeName: mockUser.name,
          departmentId: mockUser.departmentId.toString(),
          departmentName: mockUser.departmentName,
          activityType: this.activityType,
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
    const foundType = this.activityTypes.find(t => t.activityId === type || t.activityType === type);
    return foundType ? foundType.activityDescription : type;
  }

  setActivityTypeTitle(): void {
    if (this.data.activityType) {
      const activityType = this.activityTypes.find(t => t.activityId === this.data.activityType || t.activityType === this.data.activityType);
      if (activityType) {
        this.title = `Đăng ký ${activityType.activityDescription}`;
      }
    }
  }
} 