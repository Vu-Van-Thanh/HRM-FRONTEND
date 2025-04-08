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
      activityType: ActivityType.LEAVE,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-03'),
      startTime: '09:00',
      endTime: '18:00',
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
      activityType: ActivityType.REMOTE,
      startDate: new Date('2024-04-05'),
      endDate: new Date('2024-04-05'),
      startTime: '09:00',
      endTime: '18:00',
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
      activityType: ActivityType.OVERTIME,
      startDate: new Date('2024-04-10'),
      endDate: new Date('2024-04-10'),
      startTime: '09:00',
      endTime: '18:00',
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
      activityType: ActivityType.BUSINESS_TRIP,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-04-17'),
      startTime: '09:00',
      endTime: '18:00',
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
      status: ActivityStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockActivities.push(newActivity);
    return of(newActivity);
  }

  updateActivity(id: number, activity: Partial<Activity>): Observable<Activity> {
    // TODO: Replace with actual API call
    const index = this.mockActivities.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockActivities[index] = { ...this.mockActivities[index], ...activity, updatedAt: new Date() };
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
    // Mock form fields based on activity type
    let fields: ActivityField[] = [];
    
    if (activityType === ActivityType.LEAVE) {
      fields = [
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
          name: 'leaveType',
          label: 'Loại nghỉ phép',
          type: 'select',
          required: true,
          options: [
            { value: 'ANNUAL', label: 'Nghỉ phép năm' },
            { value: 'SICK', label: 'Nghỉ ốm' },
            { value: 'PERSONAL', label: 'Nghỉ việc riêng' },
            { value: 'MATERNITY', label: 'Nghỉ thai sản' },
            { value: 'BEREAVEMENT', label: 'Nghỉ tang' }
          ]
        },
        {
          name: 'reason',
          label: 'Lý do',
          type: 'textarea',
          required: true
        },
        {
          name: 'contactInfo',
          label: 'Thông tin liên hệ khi nghỉ',
          type: 'text',
          required: true
        },
        {
          name: 'handoverWork',
          label: 'Bàn giao công việc',
          type: 'textarea',
          required: false
        }
      ];
    } else if (activityType === ActivityType.REMOTE) {
      fields = [
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
          required: true
        },
        {
          name: 'endTime',
          label: 'Giờ kết thúc',
          type: 'time',
          required: true
        },
        {
          name: 'remoteType',
          label: 'Hình thức làm việc từ xa',
          type: 'select',
          required: true,
          options: [
            { value: 'FULL_DAY', label: 'Cả ngày' },
            { value: 'PARTIAL_DAY', label: 'Một phần ngày' }
          ]
        },
        {
          name: 'reason',
          label: 'Lý do',
          type: 'textarea',
          required: true
        },
        {
          name: 'workLocation',
          label: 'Địa điểm làm việc',
          type: 'text',
          required: true
        },
        {
          name: 'equipment',
          label: 'Thiết bị cần thiết',
          type: 'textarea',
          required: false
        },
        {
          name: 'availability',
          label: 'Khả năng liên lạc',
          type: 'select',
          required: true,
          options: [
            { value: 'AVAILABLE', label: 'Luôn sẵn sàng' },
            { value: 'PARTIAL', label: 'Một phần thời gian' },
            { value: 'SPECIFIC', label: 'Thời gian cụ thể' }
          ]
        }
      ];
    }
    
    return of(fields);
  }

  createActivityRecord(record: Partial<Activity>): Observable<Activity> {
    return this.createActivity(record);
  }

  updateActivityRecord(id: number, record: Partial<Activity>): Observable<Activity> {
    return this.updateActivity(id, record);
  }
} 