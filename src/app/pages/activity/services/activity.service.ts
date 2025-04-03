import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Activity, ActivityStatus, ActivityType } from '../models/activity.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiBaseUrl}/activities`;

  // Mock data
  private mockActivities: Activity[] = [
    {
      id: 1,
      employeeId: 1,
      employeeName: 'Nguyễn Văn A',
      departmentId: 1,
      departmentName: 'Phòng Nhân sự',
      type: ActivityType.LEAVE,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-03'),
      reason: 'Nghỉ phép gia đình',
      status: ActivityStatus.PENDING,
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25')
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: 'Trần Thị B',
      departmentName: 'Phòng Kế toán',
      departmentId: 2,
      type: ActivityType.REMOTE,
      startDate: new Date('2024-04-05'),
      endDate: new Date('2024-04-05'),
      reason: 'Làm việc từ xa do thời tiết',
      status: ActivityStatus.APPROVED,
      approvedBy: 1,
      approvedByName: 'Admin',
      approvedAt: new Date('2024-03-26'),
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-26')
    },
    {
      id: 3,
      employeeId: 3,
      employeeName: 'Lê Văn C',
      departmentName: 'Phòng IT',
      departmentId: 3,
      type: ActivityType.OVERTIME,
      startDate: new Date('2024-04-10'),
      endDate: new Date('2024-04-10'),
      reason: 'Tăng ca dự án',
      status: ActivityStatus.REJECTED,
      approvedBy: 1,
      approvedByName: 'Admin',
      approvedAt: new Date('2024-03-27'),
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-27')
    },
    {
      id: 4,
      employeeId: 4,
      employeeName: 'Phạm Thị D',
      departmentName: 'Phòng Marketing',
      departmentId: 4,
      type: ActivityType.BUSINESS_TRIP,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-04-17'),
      reason: 'Công tác tại Hà Nội',
      status: ActivityStatus.PENDING,
      createdAt: new Date('2024-03-28'),
      updatedAt: new Date('2024-03-28')
    }
  ];

  constructor(private http: HttpClient) { }

  getActivities(params?: any): Observable<Activity[]> {
    // Return mock data instead of making HTTP request
    let filteredActivities = [...this.mockActivities];

    if (params) {
      if (params.department) {
        filteredActivities = filteredActivities.filter(activity => 
          activity.departmentName === params.department
        );
      }
      if (params.type) {
        filteredActivities = filteredActivities.filter(activity => 
          activity.type === params.type
        );
      }
      if (params.status) {
        filteredActivities = filteredActivities.filter(activity => 
          activity.status === params.status
        );
      }
    }

    return of(filteredActivities);
  }

  getActivityById(id: number): Observable<Activity> {
    const activity = this.mockActivities.find(a => a.id === id);
    return of(activity!);
  }

  approveActivity(id: number): Observable<Activity> {
    const activity = this.mockActivities.find(a => a.id === id);
    if (activity) {
      activity.status = ActivityStatus.APPROVED;
      activity.approvedBy = 1; // Mock admin ID
      activity.approvedByName = 'Admin';
      activity.approvedAt = new Date();
      activity.updatedAt = new Date();
    }
    return of(activity!);
  }

  rejectActivity(id: number, reason: string): Observable<Activity> {
    const activity = this.mockActivities.find(a => a.id === id);
    if (activity) {
      activity.status = ActivityStatus.REJECTED;
      activity.approvedBy = 1; // Mock admin ID
      activity.approvedByName = 'Admin';
      activity.approvedAt = new Date();
      activity.updatedAt = new Date();
    }
    return of(activity!);
  }

  getActivityTypes(): ActivityType[] {
    return Object.values(ActivityType);
  }

  getActivityStatuses(): ActivityStatus[] {
    return Object.values(ActivityStatus);
  }
} 