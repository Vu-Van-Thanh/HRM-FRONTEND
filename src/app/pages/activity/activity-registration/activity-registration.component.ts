import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityService } from '../services/activity.service';
import { ActivityType } from '../models/activity.model';

@Component({
  selector: 'app-activity-registration',
  templateUrl: './activity-registration.component.html',
  styleUrls: ['./activity-registration.component.scss']
})
export class ActivityRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  activityType: ActivityType;
  formFields: any[] = [];
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private snackBar: MatSnackBar
  ) {
    this.registrationForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Get activity type from route
    this.route.params.subscribe(params => {
      const type = params['type'];
      if (type === 'leave') {
        this.activityType = ActivityType.LEAVE;
      } else if (type === 'remote') {
        this.activityType = ActivityType.REMOTE;
      } else {
        this.router.navigate(['/system/activity']);
        return;
      }
      
      this.loadFormFields();
    });
  }

  loadFormFields(): void {
    this.isLoading = true;
    
    // Get form fields from service
    this.activityService.getActivityFields(this.activityType).subscribe({
      next: (fields) => {
        this.formFields = fields;
        
        // Create form controls
        const formControls: any = {};
        fields.forEach(field => {
          const validators = field.required ? [Validators.required] : [];
          formControls[field.name] = ['', validators];
        });
        
        this.registrationForm = this.fb.group(formControls);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading form fields:', error);
        this.isLoading = false;
        this.snackBar.open('Không thể tải form đăng ký', 'Đóng', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    
    // Prepare activity data
    const formValue = this.registrationForm.value;
    const activityData = {
      ...formValue,
      activityType: this.activityType,
      status: 'PENDING'
    };
    
    // Submit activity
    this.activityService.createActivity(activityData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Đăng ký thành công', 'Đóng', { duration: 3000 });
        this.router.navigate(['/system/activity', this.activityType.toLowerCase()]);
      },
      error: (error) => {
        console.error('Error submitting activity:', error);
        this.isSubmitting = false;
        this.snackBar.open('Không thể đăng ký', 'Đóng', { duration: 3000 });
      }
    });
  }

  getFieldType(field: any): string {
    return field.type || 'text';
  }

  getFieldOptions(field: any): any[] {
    return field.options || [];
  }
} 