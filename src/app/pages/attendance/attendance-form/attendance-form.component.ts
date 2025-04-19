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
  duration: string = '00:00';

  projects: string[] = [
    'JSI FLE Bảo trì 20 (JSI)',
    'KAF FDS Sản phẩm 24 (ROS - KAFI)',
    'KSS FLE Bảo trì 24 (KSS)',
    'MISC (FSS)',
    'TCB CBP Kinh doanh HN (TCB)'
  ];

  activities: string[] = [
    'Lập trình',
    'Phân tích',
    'Quản trị',
    'Support',
    'Test',
    'Thiết kế'
  ];

  costCenters: string[] = [
    'IT Department',
    'HR Department',
    'Finance Department'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AttendanceFormComponent>,
    private toastService: ToastService
  ) {
    this.attendanceForm = this.fb.group({
      project: ['', Validators.required],
      activity: ['', Validators.required],
      description: [''],
      date: [new Date(), Validators.required],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      overtime: [0],
      notes: [''],
      costCenter: [''],
      estimatedCost: [0]
    });
  }

  ngOnInit(): void {
    this.attendanceForm.valueChanges.subscribe(() => {
      this.calculateDuration();
    });
  }

  calculateDuration(): void {
    const checkIn = this.attendanceForm.get('checkIn')?.value;
    const checkOut = this.attendanceForm.get('checkOut')?.value;
    if (checkIn && checkOut) {
      const [startHours, startMinutes] = checkIn.split(':').map(Number);
      const [endHours, endMinutes] = checkOut.split(':').map(Number);
      const start = new Date();
      const end = new Date();
      start.setHours(startHours, startMinutes);
      end.setHours(endHours, endMinutes);
      const diff = (end.getTime() - start.getTime()) / 1000 / 60;
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      this.duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      this.duration = '00:00';
    }
  }

  onSubmit(): void {
    if (this.attendanceForm.valid) {
      this.toastService.success('Attendance saved successfully!');
      this.dialogRef.close(this.attendanceForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 