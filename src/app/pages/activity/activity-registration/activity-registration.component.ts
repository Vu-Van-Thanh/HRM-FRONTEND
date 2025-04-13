import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityService } from '../services/activity.service';
import { Activity, ActivityType } from '../models/activity.model';

@Component({
  selector: 'app-activity-registration',
  templateUrl: './activity-registration.component.html',
  styleUrls: ['./activity-registration.component.scss']
})
export class ActivityRegistrationComponent implements OnInit {
  activityType: string = '';
  registrationType: 'leave' | 'remote' = 'leave';
  form: FormGroup;
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
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.activityType = ActivityType.REGISTRATION;
    this.registrationType = this.route.snapshot.params['type'] as 'leave' | 'remote';
    
    this.loadFormFields();
  }

  loadFormFields(): void {
    this.isLoading = true;
    
    this.activityService.getActivityFields(this.activityType).subscribe({
      next: (fields) => {
        this.formFields = fields;
        
        const formControls: any = {};
        fields.forEach(field => {
          const validators = field.required ? [Validators.required] : [];
          formControls[field.name] = ['', validators];
        });
        
        this.form = this.fb.group(formControls);
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
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    
    const formValue = this.form.value;
    const activityData: Activity = {
      ...formValue,
      activityType: this.activityType as ActivityType,
      registrationType: this.registrationType,
      status: 'PENDING'
    };
    
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

  onBack(): void {
    this.router.navigate(['/system/activity', this.activityType.toLowerCase()]);
  }

  getFieldType(field: any): string {
    return field.type || 'text';
  }

  getFieldOptions(field: any): any[] {
    return field.options || [];
  }
} 