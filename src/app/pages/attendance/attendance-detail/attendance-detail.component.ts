import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-attendance-detail',
  templateUrl: './attendance-detail.component.html',
  styleUrls: ['./attendance-detail.component.scss']
})
export class AttendanceDetailComponent implements OnInit {
  attendance: any;

  constructor(
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Load attendance detail from API
      this.loadAttendanceDetail(id);
    }
  }

  loadAttendanceDetail(id: string): void {
    // Mock data for now
    this.attendance = {
      id: 1,
      employeeId: 1,
      employeeName: 'John Doe',
      date: new Date('2024-04-14'),
      checkIn: '08:00',
      checkOut: '17:00',
      status: 'Present',
      note: 'On time'
    };
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Present':
        return 'primary';
      case 'Absent':
        return 'warn';
      case 'Late':
        return 'accent';
      case 'Early Leave':
        return 'accent';
      default:
        return '';
    }
  }
} 