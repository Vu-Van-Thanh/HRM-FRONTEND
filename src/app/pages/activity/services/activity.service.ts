import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Activity, ActivityStatus, ActivityType, ActivityField } from '../models/activity.model';
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
      activityType: ActivityType.REGISTRATION,
      registrationType: 'leave',
      startDate: '2024-04-01',
      endDate: '2024-04-02',
      leaveType: 'Nghỉ phép năm',
      reason: 'Nghỉ phép cá nhân',
      status: 'PENDING',
      createdAt: '2024-03-30T10:00:00',
      updatedAt: '2024-03-30T10:00:00'
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: 'Trần Thị B',
      departmentId: 2,
      departmentName: 'Phòng Kế toán',
      activityType: ActivityType.REGISTRATION,
      registrationType: 'remote',
      startDate: '2024-04-03',
      endDate: '2024-04-03',
      startTime: '09:00',
      endTime: '17:00',
      remoteType: 'Làm việc từ xa',
      reason: 'Làm việc tại nhà',
      status: 'APPROVED',
      createdAt: '2024-03-29T15:30:00',
      updatedAt: '2024-03-30T09:00:00'
    },
    {
      id: 3,
      employeeId: 3,
      employeeName: 'Lê Văn C',
      departmentName: 'Phòng IT',
      departmentId: 3,
      activityType: ActivityType.OVERTIME,
      startDate: '2024-04-10',
      endDate: '2024-04-10',
      startTime: '09:00',
      endTime: '18:00',
      reason: 'Tăng ca dự án',
      status: 'REJECTED',
      approvedBy: 1,
      approvedByName: 'Admin',
      approvedAt: '2024-03-27T00:00:00',
      createdAt: '2024-03-25T00:00:00',
      updatedAt: '2024-03-27T00:00:00'
    },
    {
      id: 4,
      employeeId: 4,
      employeeName: 'Phạm Thị D',
      departmentName: 'Phòng Marketing',
      departmentId: 4,
      activityType: ActivityType.BUSINESS_TRIP,
      startDate: '2024-04-15',
      endDate: '2024-04-17',
      startTime: '09:00',
      endTime: '18:00',
      reason: 'Công tác tại Hà Nội',
      status: 'PENDING',
      createdAt: '2024-03-28T00:00:00',
      updatedAt: '2024-03-28T00:00:00'
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
      if (params.activityType) {
        filteredActivities = filteredActivities.filter(activity => 
          activity.activityType === params.activityType
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
      activity.status = 'APPROVED';
      activity.approvedBy = 1; // Mock admin ID
      activity.approvedByName = 'Admin';
      activity.approvedAt = new Date().toISOString();
      activity.updatedAt = new Date().toISOString();
    }
    return of(activity!);
  }

  rejectActivity(id: number, reason: string): Observable<Activity> {
    const activity = this.mockActivities.find(a => a.id === id);
    if (activity) {
      activity.status = 'REJECTED';
      activity.approvedBy = 1; // Mock admin ID
      activity.approvedByName = 'Admin';
      activity.approvedAt = new Date().toISOString();
      activity.updatedAt = new Date().toISOString();
    }
    return of(activity!);
  }

  getActivityTypes(): ActivityType[] {
    return Object.values(ActivityType);
  }

  getActivityStatuses(): ActivityStatus[] {
    return Object.values(ActivityStatus);
  }

  createActivity(activity: Partial<Activity>): Observable<Activity> {
    // TODO: Replace with actual API call
    const newActivity: Activity = {
      id: this.mockActivities.length + 1,
      employeeId: activity.employeeId!,
      employeeName: activity.employeeName!,
      departmentId: activity.departmentId!,
      departmentName: activity.departmentName!,
      activityType: activity.activityType!,
      startDate: activity.startDate!,
      endDate: activity.endDate!,
      startTime: activity.startTime!,
      endTime: activity.endTime!,
      reason: activity.reason!,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.mockActivities.push(newActivity);
    return of(newActivity);
  }

  updateActivity(id: number, activity: Partial<Activity>): Observable<Activity> {
    // TODO: Replace with actual API call
    const index = this.mockActivities.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockActivities[index] = { 
        ...this.mockActivities[index], 
        ...activity, 
        updatedAt: new Date().toISOString() 
      };
      return of(this.mockActivities[index]);
    }
    throw new Error('Activity not found');
  }

  deleteActivity(id: number): Observable<void> {
    // TODO: Replace with actual API call
    const index = this.mockActivities.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockActivities.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Activity not found');
  }

  getActivityFields(activityType: string): Observable<ActivityField[]> {
    if (activityType === ActivityType.REGISTRATION) {
      return of([
        {
          name: 'startDate',
          label: 'Ngày bắt đầu',
          type: 'date',
          required: true
        },
        {
          name: 'endDate',
          label: 'Ngày kết thúc',
          type: 'date',
          required: true
        },
        {
          name: 'startTime',
          label: 'Giờ bắt đầu',
          type: 'time',
          required: false
        },
        {
          name: 'endTime',
          label: 'Giờ kết thúc',
          type: 'time',
          required: false
        },
        {
          name: 'registrationType',
          label: 'Loại đăng ký',
          type: 'select',
          required: true,
          options: [
            { value: 'leave', label: 'Nghỉ phép' },
            { value: 'remote', label: 'Làm việc từ xa' }
          ]
        },
        {
          name: 'reason',
          label: 'Lý do',
          type: 'textarea',
          required: true
        }
      ]);
    }
    return of([]);
  }

  createActivityRecord(record: Partial<Activity>): Observable<Activity> {
    return this.createActivity(record);
  }

  updateActivityRecord(id: number, record: Partial<Activity>): Observable<Activity> {
    return this.updateActivity(id, record);
  }
} 