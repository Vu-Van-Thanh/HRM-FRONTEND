import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { Activity, ActivityStatus, ActivityType, ActivityField } from '../models/activity.model';
import { environment } from '../../../../environments/environment';
import { delay, tap, catchError } from 'rxjs/operators';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { Department } from 'src/app/system/department/department.model';
import { EmployeeDepartmentDTO } from 'src/app/system/salary/salary.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiBaseUrl}/activities`;

  // Mock data
  private mockActivities: Activity[] = [
    {
      requestId: '1',
      employeeId: '1',
      employeeName: 'Nguyễn Văn A',
      activityId: 'REGISTRATION',
      departmentName: 'Phòng Nhân sự',
      activityType: 'REGISTRATION',
      startTime: '2024-04-01T00:00:00',
      endTime: '2024-04-02T00:00:00',
      status: 'PENDING',
      createdAt: '2024-03-30T10:00:00',
      requestFlds: JSON.stringify({
        TaskName: 'Nghỉ phép cá nhân',
        EstimatedHours: 16
      }),
      reason: 'Nghỉ phép cá nhân'
    },
    {
      requestId: '2',
      employeeId: '2',
      employeeName: 'Trần Thị B',
      activityId: 'REGISTRATION',
      departmentName: 'Phòng Kế toán',
      activityType: 'REGISTRATION',
      startTime: '2024-04-03T09:00:00',
      endTime: '2024-04-03T17:00:00',
      status: 'APPROVED',
      createdAt: '2024-03-29T15:30:00',
      requestFlds: JSON.stringify({
        TaskName: 'Làm việc tại nhà',
        EstimatedHours: 8
      }),
      reason: 'Làm việc tại nhà'
    },
    {
      requestId: '3',
      employeeId: '3',
      employeeName: 'Lê Văn C',
      departmentName: 'Phòng IT',
      activityId: 'OVERTIME',
      activityType: 'OVERTIME',
      startTime: '2024-04-10T09:00:00',
      endTime: '2024-04-10T18:00:00',
      status: 'REJECTED',
      createdAt: '2024-03-25T00:00:00',
      requestFlds: JSON.stringify({
        TaskName: 'Tăng ca dự án',
        EstimatedHours: 9
      }),
      reason: 'Tăng ca dự án'
    },
    {
      requestId: '4',
      employeeId: '4',
      employeeName: 'Phạm Thị D',
      departmentName: 'Phòng Marketing',
      activityId: 'BUSINESS_TRIP',
      activityType: 'BUSINESS_TRIP',
      startTime: '2024-04-15T09:00:00',
      endTime: '2024-04-17T18:00:00',
      status: 'PENDING',
      createdAt: '2024-03-28T00:00:00',
      requestFlds: JSON.stringify({
        TaskName: 'Công tác tại Hà Nội',
        EstimatedHours: 24
      }),
      reason: 'Công tác tại Hà Nội'
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

  getActivityById(id: string): Observable<Activity> {
    const activity = this.mockActivities.find(a => a.requestId === id);
    return of(activity!);
  }

  approveActivity(id: string): Observable<Activity> {
    const activity = this.mockActivities.find(a => a.requestId === id);
    if (activity) {
      activity.status = 'APPROVED';
      const requestFldsObj = JSON.parse(activity.requestFlds);
      requestFldsObj.ApprovedBy = 'Admin';
      requestFldsObj.ApprovedAt = new Date().toISOString();
      activity.requestFlds = JSON.stringify(requestFldsObj);
    }
    return of(activity!);
  }

  rejectActivity(id: string, reason: string): Observable<Activity> {
    const activity = this.mockActivities.find(a => a.requestId === id);
    if (activity) {
      activity.status = 'REJECTED';
      const requestFldsObj = JSON.parse(activity.requestFlds);
      requestFldsObj.RejectedBy = 'Admin';
      requestFldsObj.RejectedAt = new Date().toISOString();
      requestFldsObj.RejectReason = reason;
      activity.requestFlds = JSON.stringify(requestFldsObj);
    }
    return of(activity!);
  }

  getActivityTypes(): Observable<ActivityType[]> {
    return this.http.get<ActivityType[]>(API_ENDPOINT.getAllActivityType)
      .pipe(
        tap(types => console.log('✅ Danh sách loại hoạt động:', types)),
        catchError(error => {
          console.error('❌ Lỗi khi tải danh sách loại hoạt động:', error);
          return of([]);
        })
      );
  }

  getActivityStatuses(): ActivityStatus[] {
    return Object.values(ActivityStatus);
  }

  createActivity(activity: Partial<Activity>): Observable<Activity> {
    // Tạo một activity mới với định dạng mới
    const newActivity: Activity = {
      requestId: (this.mockActivities.length + 1).toString(),
      employeeId: activity.employeeId!,
      employeeName: activity.employeeName!,
      activityId: activity.activityId || 'ATTENDANCE',
      departmentName: activity.departmentName!,
      activityType: activity.activityType!,
      startTime: activity.startTime!,
      endTime: activity.endTime!,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      requestFlds: JSON.stringify({
        TaskName: activity.reason || 'Không có lý do',
        EstimatedHours: 8
      })
    };
    this.mockActivities.push(newActivity);
    return of(newActivity);
  }

  updateActivity(id: string, activity: Partial<Activity>): Observable<Activity> {
    // Cập nhật activity
    const index = this.mockActivities.findIndex(a => a.requestId === id);
    if (index !== -1) {
      // Tạo bản sao của requestFlds
      let requestFldsObj = {};
      try {
        requestFldsObj = JSON.parse(this.mockActivities[index].requestFlds);
      } catch (e) {
        console.error('Lỗi khi parse requestFlds:', e);
      }

      // Cập nhật thông tin mới
      if (activity.reason) {
        requestFldsObj = {
          ...requestFldsObj,
          TaskName: activity.reason
        };
      }

      // Cập nhật activity
      this.mockActivities[index] = { 
        ...this.mockActivities[index], 
        ...activity,
        requestFlds: JSON.stringify(requestFldsObj)
      };
      
      return of(this.mockActivities[index]);
    }
    throw new Error('Activity not found');
  }

  deleteActivity(id: string, reason?: string): Observable<any> {
    // Xóa activity
    const index = this.mockActivities.findIndex(a => a.requestId === id);
    if (index !== -1) {
      this.mockActivities.splice(index, 1);
    }
    return of(null).pipe(delay(500));
  }

  getActivityFields(activityType: string): Observable<ActivityField[]> {
    // Common fields for all activity types
    const commonFields: ActivityField[] = [
      {
        name: 'startTime',
        label: 'Thời gian bắt đầu',
        type: 'datetime',
        required: true
      },
      {
        name: 'endTime',
        label: 'Thời gian kết thúc',
        type: 'datetime',
        required: true
      },
      {
        name: 'reason',
        label: 'Lý do',
        type: 'textarea',
        required: true
      }
    ];

    // Thêm trường bổ sung tùy theo activityType
    switch (activityType) {
      case 'REGISTRATION':
        return of([...commonFields]);
        
      case 'OVERTIME':
        return of([
          ...commonFields,
          {
            name: 'estimatedHours',
            label: 'Số giờ ước tính',
            type: 'number',
            required: true
          }
        ]);
        
      case 'BUSINESS_TRIP':
        return of([
          ...commonFields,
          {
            name: 'location',
            label: 'Địa điểm công tác',
            type: 'text',
            required: true
          }
        ]);
        
      case 'ATTENDANCE':
        return of([
          ...commonFields,
          {
            name: 'taskName',
            label: 'Tên công việc',
            type: 'text',
            required: true
          }
        ]);
        
      default:
        return of(commonFields);
    }
  }

  createActivityRecord(record: Partial<Activity>): Observable<Activity> {
    return this.createActivity(record);
  }

  updateActivityRecord(id: string, record: Partial<Activity>): Observable<Activity> {
    return this.updateActivity(id, record);
  }

  /**
   * Lấy danh sách activities từ API với bộ lọc
   * @param filters Bộ lọc (managerID, departmentID, employeeID, activityType, activityStatus, startTime, endTime)
   */
  getActivitiesByFilter(filters: {
    managerID?: string;
    departmentID?: string;
    employeeID?: string;
    activityType?: string;
    activityStatus?: string;
    startTime?: string;
    endTime?: string;
  }): Observable<Activity[]> {
    return this.http.get<Activity[]>(API_ENDPOINT.getAllActivity, { params: { ...filters } })
      .pipe(
        tap(activities => console.log('✅ Dữ liệu hoạt động:', activities)),
        catchError(error => {
          console.error('❌ Lỗi khi tải dữ liệu hoạt động:', error);
          return of([]);
        })
      );
  }

  /**
   * Lấy danh sách nhân viên theo bộ lọc
   */
  getEmployeesByFilter(filters: {
    managerID?: string;
    departmentID?: string;
    employeeID?: string;
  }): Observable<EmployeeDepartmentDTO[]> {
    return this.http.get<EmployeeDepartmentDTO[]>(API_ENDPOINT.getEmployeeID, { params: { ...filters } })
      .pipe(
        tap(employees => console.log('✅ Danh sách nhân viên:', employees)),
        catchError(error => {
          console.error('❌ Lỗi khi tải dữ liệu nhân viên:', error);
          return of([]);
        })
      );
  }

  /**
   * Lấy danh sách phòng ban
   */
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(API_ENDPOINT.getAllDepartment)
      .pipe(
        tap(departments => console.log('✅ Danh sách phòng ban:', departments)),
        catchError(error => {
          console.error('❌ Lỗi khi tải dữ liệu phòng ban:', error);
          return of([]);
        })
      );
  }

  /**
   * Lấy cả nhân viên, phòng ban và hoạt động trong một lần gọi
   */
  getActivityDataWithFilters(filters: {
    managerID?: string;
    departmentID?: string;
    employeeID?: string;
    activityType?: string;
    activityStatus?: string;
    startTime?: string;
    endTime?: string;
  }): Observable<{
    activities: Activity[];
    employees: EmployeeDepartmentDTO[];
    departments: Department[];
  }> {
    return forkJoin({
      employees: this.getEmployeesByFilter({
        managerID: filters.managerID,
        departmentID: filters.departmentID,
        employeeID: filters.employeeID
      }),
      departments: this.getDepartments(),
      activities: this.getActivitiesByFilter(filters)
    });
  }
} 