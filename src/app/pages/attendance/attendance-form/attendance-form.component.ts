import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-attendance-form',
  templateUrl: './attendance-form.component.html',
  styleUrls: ['./attendance-form.component.scss']
})
export class AttendanceFormComponent implements OnInit {
  attendanceForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AttendanceFormComponent>,
    private toastService: ToastService
  ) {
    this.attendanceForm = this.fb.group({
      employeeId: ['', Validators.required],
      date: [new Date(), Validators.required],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      status: ['Present', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    // Load data if in edit mode
  }

  onSubmit(): void {
    if (this.attendanceForm.valid) {
      // Handle form submission
      this.toastService.success('Attendance saved successfully!');
      this.dialogRef.close(this.attendanceForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 