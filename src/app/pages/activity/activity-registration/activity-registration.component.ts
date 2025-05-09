import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityService } from '../services/activity.service';
import { Activity } from '../models/activity.model';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';

interface ActivityType {
  activityId: string;
  activityDescription: string;
  activityType: string;
}

interface ActivityField {
  fieldId: string;
  activityId: string;
  fieldType: string;
  fieldName: string;
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-activity-registration',
  templateUrl: './activity-registration.component.html',
  styleUrls: ['./activity-registration.component.scss']
})
export class ActivityRegistrationComponent implements OnInit {
  activityTypes: ActivityType[] = [];
  selectedActivityId: string = '';
  selectedActivity: ActivityType | null = null;
  formFields: ActivityField[] = [];
  form: FormGroup;
  isLoading = false;
  isSubmitting = false;
  employeeId: string = '';
  
  // For the time inputs
  startTimeInput: string = '';
  endTimeInput: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ActivityRegistrationComponent>
  ) {
    // Initialize form with just date fields
    const currentDate = new Date();
    this.form = this.fb.group({
      startTime: [currentDate, Validators.required],
      endTime: [currentDate, Validators.required]
    });
    
    // Initialize time inputs
    this.startTimeInput = this.formatTimeForInput(currentDate);
    this.endTimeInput = this.formatTimeForInput(currentDate);
    
    // Get employee ID from localStorage
    const currentUserProfileRaw = localStorage.getItem('currentUserProfile');
    if (currentUserProfileRaw) {
      try {
        const currentUserProfile = JSON.parse(currentUserProfileRaw);
        if (currentUserProfile.employeeID) {
          this.employeeId = currentUserProfile.employeeID;
        }
      } catch (error) {
        console.error('Error parsing currentUserProfile from localStorage:', error);
      }
    }
  }

  // Format a date to HH:MM format for time input
  formatTimeForInput(date: Date): string {
    return date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0');
  }

  // Update the datetime values when time input changes
  updateDateTime(type: 'start' | 'end'): void {
    console.log(`Updating ${type} datetime`);
    
    try {
      if (type === 'start') {
        const date = this.form.get('startTime')?.value as Date;
        if (date && this.startTimeInput) {
          console.log('Original startTime date:', date);
          console.log('Start time input:', this.startTimeInput);
          
          const [hours, minutes] = this.startTimeInput.split(':').map(Number);
          // Create a new date object to avoid mutation issues
          const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
          
          console.log('Updated startTime date:', newDate);
          this.form.get('startTime')?.setValue(newDate);
        }
      } else {
        const date = this.form.get('endTime')?.value as Date;
        if (date && this.endTimeInput) {
          console.log('Original endTime date:', date);
          console.log('End time input:', this.endTimeInput);
          
          const [hours, minutes] = this.endTimeInput.split(':').map(Number);
          // Create a new date object to avoid mutation issues
          const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
          
          console.log('Updated endTime date:', newDate);
          this.form.get('endTime')?.setValue(newDate);
        }
      }
    } catch (error) {
      console.error('Error updating datetime:', error);
    }
  }

  ngOnInit(): void {
    this.loadActivityTypes();
  }

  loadActivityTypes(): void {
    this.isLoading = true;
    this.activityService.getActivityTypes().subscribe({
      next: (types) => {
        this.activityTypes = types;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activity types:', error);
        this.snackBar.open('Không thể tải danh sách loại hoạt động', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onActivityTypeChange(): void {
    if (!this.selectedActivityId) {
      return;
    }

    this.isLoading = true;
    
    // Find the selected activity
    this.selectedActivity = this.activityTypes.find(a => a.activityId === this.selectedActivityId) || null;
    
    // Load activity fields with query parameter
    const params = new HttpParams().set('activityId', this.selectedActivityId);
    this.http.get<ActivityField[]>(API_ENDPOINT.getAllActivityFld, { params }).subscribe({
      next: (fields) => {
        // Process fields and add default options for ComboBox if needed
        this.formFields = fields.map(field => {
          // Process any field-specific options or transformations here
          if (field.fieldType === 'ComboBox' && !field.options) {
            field.options = [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' }
            ];
          }
          return field;
        });
        
        // Create form controls based on fields
        const currentDate = new Date();
        const formControls: any = {
          startTime: [currentDate, Validators.required],
          endTime: [currentDate, Validators.required]
        };
        
        fields.forEach(field => {
          let defaultValue = '';
          
          // Set appropriate default values based on field type
          if (field.fieldType === 'DateTime') {
            defaultValue = new Date().toISOString();
          } else if (field.fieldType === 'ComboBox' && field.options && field.options.length > 0) {
            defaultValue = field.options[0].value;
          }
          
          formControls[field.fieldId] = [defaultValue, Validators.required];
        });
        
        this.form = this.fb.group(formControls);
        
        // Initialize time inputs
        this.startTimeInput = this.formatTimeForInput(currentDate);
        this.endTimeInput = this.formatTimeForInput(currentDate);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activity fields:', error);
        this.snackBar.open('Không thể tải form đăng ký', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // Get options for ComboBox fields
  getFieldOptions(field: ActivityField): { value: string; label: string }[] {
    return field.options || [];
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedActivity || !this.employeeId) {
      if (!this.employeeId) {
        this.snackBar.open('Không tìm thấy thông tin nhân viên, vui lòng đăng nhập lại', 'Đóng', { duration: 3000 });
      }
      return;
    }

    // Make sure the datetime values are updated with the latest time inputs
    this.updateDateTime('start');
    this.updateDateTime('end');

    this.isSubmitting = true;
    
    const formValue = this.form.value;
    
    // Get the date values with proper time components
    const startDate = formValue.startTime as Date;
    const endDate = formValue.endTime as Date;
    
    console.log('Thời gian bắt đầu (giờ VN):', this.formatVietnamDateTime(startDate));
    console.log('Thời gian kết thúc (giờ VN):', this.formatVietnamDateTime(endDate));
    
    // Explicitly set the time components again to ensure they're applied
    if (startDate && this.startTimeInput) {
      const [startHours, startMinutes] = this.startTimeInput.split(':').map(Number);
      startDate.setHours(startHours, startMinutes, 0, 0);
    }
    
    if (endDate && this.endTimeInput) {
      const [endHours, endMinutes] = this.endTimeInput.split(':').map(Number);
      endDate.setHours(endHours, endMinutes, 0, 0);
    }
    
    console.log('Đã chọn thời gian bắt đầu (giờ VN):', this.formatVietnamDateTime(startDate));
    console.log('Đã chọn thời gian kết thúc (giờ VN):', this.formatVietnamDateTime(endDate));
    
    // Tính toán estimatedHours - số giờ giữa endTime và startTime
    const diffMs = endDate.getTime() - startDate.getTime();
    // Chuyển đổi từ mili giây sang giờ và làm tròn đến 2 chữ số thập phân
    const estimatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    
    console.log('Số giờ ước tính:', estimatedHours);
    
    // Prepare form data as a JSON string for RequestFlds with field names
    const requestFlds: Record<string, any> = {};
    this.formFields.forEach(field => {
      let fieldValue = formValue[field.fieldId];
      
      // Format date values for DateTime fields
      if (field.fieldType === 'DateTime' && fieldValue instanceof Date) {
        fieldValue = fieldValue.toISOString();
      }
      
      // Lưu cả tên trường và giá trị
      requestFlds[field.fieldId] = {
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        value: fieldValue
      };
    });
    
    // Thêm estimatedHours vào requestFlds
    requestFlds['estimatedHours'] = {
      fieldName: 'Số giờ ước tính',
      fieldType: 'Number',
      value: estimatedHours
    };
    
    // Tạo bản sao của thời gian đã chọn để tránh ảnh hưởng đến UI
    const startDateToSend = new Date(startDate.getTime());
    const endDateToSend = new Date(endDate.getTime());
    
    // Thêm 7 giờ để bù trừ cho việc server hiểu sai múi giờ
    startDateToSend.setHours(startDateToSend.getHours() + 7);
    endDateToSend.setHours(endDateToSend.getHours() + 7);
    
    console.log('Thời gian bắt đầu ĐIỀU CHỈNH (giờ VN):', this.formatVietnamDateTime(startDateToSend));
    console.log('Thời gian kết thúc ĐIỀU CHỈNH (giờ VN):', this.formatVietnamDateTime(endDateToSend));
    
    // Create activity request according to ActivityRequestDTO
    const activityData = {
      employeeId: this.employeeId,
      activityId: this.selectedActivityId,
      createdAt: new Date().toISOString(),
      startTime: startDateToSend.toISOString(),
      endTime: endDateToSend.toISOString(),
      status: 'PENDING',
      requestFlds: JSON.stringify(requestFlds),
      estimatedHours: estimatedHours 
    };
    
    // Log ISO string & giờ địa phương để kiểm tra
    console.log('Gửi lên server (ISO):', activityData.startTime, activityData.endTime);
    console.log('RequestFlds:', requestFlds);
    console.log('EstimatedHours:', activityData.estimatedHours);
    
    this.activityService.createActivity(activityData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Đăng ký thành công', 'Đóng', { duration: 3000 });
        this.dialogRef.close(true); // Close with true result to indicate success
      },
      error: (error) => {
        console.error('Error submitting activity:', error);
        this.isSubmitting = false;
        this.snackBar.open('Không thể đăng ký', 'Đóng', { duration: 3000 });
      }
    });
  }

  // Format date in Vietnam timezone
  formatVietnamDateTime(date: Date): string {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    };
    
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  }

  onBack(): void {
    if (this.selectedActivity) {
      // Go back to activity type selection
      this.selectedActivity = null;
      this.selectedActivityId = '';
      this.formFields = [];
      
      const currentDate = new Date();
      this.form = this.fb.group({
        startTime: [currentDate, Validators.required],
        endTime: [currentDate, Validators.required]
      });
      
      // Reset time inputs
      this.startTimeInput = this.formatTimeForInput(currentDate);
      this.endTimeInput = this.formatTimeForInput(currentDate);
    } else {
      // Cancel and close dialog
      this.dialogRef.close(false);
    }
  }
} 