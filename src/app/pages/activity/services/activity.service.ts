import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { Activity, ActivityStatus, ActivityField } from '../models/activity.model';
import { environment } from '../../../../environments/environment';
import { tap, catchError, map } from 'rxjs/operators';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { Department } from 'src/app/system/department/department.model';
import { EmployeeDepartmentDTO } from 'src/app/system/salary/salary.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiBaseUrl}/activities`;
  private activityBaseUrl = 'http://localhost:5295/ActivityRequest';

  constructor(private http: HttpClient) { }

  getActivities(params?: any): Observable<Activity[]> {
    // Convert object params to HttpParams (proper way to send query parameters)
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    console.log('📁 DEBUG: Query Params:', httpParams.toString());
    
    return this.http.get<Activity[]>(API_ENDPOINT.getAllActivity, { params: httpParams })
      .pipe(
        tap(activities => console.log('✅ Danh sách hoạt động:', activities)),
        catchError(error => {
          console.error('❌ Lỗi khi tải danh sách hoạt động:', error);
          return of([]);
        })
      );
  }

  getActivityById(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${this.activityBaseUrl}/activity-request/${id}`)
      .pipe(
        tap(activity => console.log('✅ Chi tiết hoạt động:', activity)),
        catchError(error => {
          console.error('❌ Lỗi khi tải chi tiết hoạt động:', error);
          throw error;
        })
      );
  }

  approveActivity(id: string): Observable<Activity> {
    return this.http.put<Activity>(`${this.activityBaseUrl}/approve/${id}`, {})
      .pipe(
        tap(activity => console.log('✅ Phê duyệt hoạt động thành công:', activity)),
        catchError(error => {
          console.error('❌ Lỗi khi phê duyệt hoạt động:', error);
          throw error;
        })
      );
  }

  rejectActivity(id: string, reason: string): Observable<Activity> {
    return this.http.put<Activity>(`${this.activityBaseUrl}/reject/${id}`, { reason })
      .pipe(
        tap(activity => console.log('✅ Từ chối hoạt động thành công:', activity)),
        catchError(error => {
          console.error('❌ Lỗi khi từ chối hoạt động:', error);
          throw error;
        })
      );
  }

  getActivityTypes(): Observable<any[]> {
    interface ActivityTypeResponse {
      activityId: string;
      activityDescription: string;
      activityType: string;
    }

    return this.http.get<ActivityTypeResponse[]>(API_ENDPOINT.getAllActivityType)
      .pipe(
        tap(activityTypes => console.log('✅ Danh sách loại hoạt động:', activityTypes)),
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
    return this.http.post<Activity>(`${this.activityBaseUrl}/activity-request`, activity)
      .pipe(
        tap(newActivity => console.log('✅ Tạo hoạt động thành công:', newActivity)),
        catchError(error => {
          console.error('❌ Lỗi khi tạo hoạt động:', error);
          throw error;
        })
      );
  }

  updateActivity(id: string, activity: Partial<Activity>): Observable<Activity> {
    return this.http.put<Activity>(`${this.activityBaseUrl}/activity-request/${id}`, activity)
      .pipe(
        tap(updatedActivity => console.log('✅ Cập nhật hoạt động thành công:', updatedActivity)),
        catchError(error => {
          console.error('❌ Lỗi khi cập nhật hoạt động:', error);
          throw error;
        })
      );
  }

  deleteActivity(id: string, reason?: string): Observable<any> {
    const params = reason ? { reason } : {};
    return this.http.delete(`${this.activityBaseUrl}/activity-request/${id}`, { params })
      .pipe(
        tap(() => console.log('✅ Xóa hoạt động thành công')),
        catchError(error => {
          console.error('❌ Lỗi khi xóa hoạt động:', error);
          throw error;
        })
      );
  }

  getActivityFields(activityType: string): Observable<ActivityField[]> {
    return this.http.get<ActivityField[]>(`${API_ENDPOINT.getAllActivityType}/fields/${activityType}`)
      .pipe(
        tap(fields => console.log('✅ Danh sách trường hoạt động:', fields)),
        catchError(error => {
          console.error('❌ Lỗi khi tải danh sách trường hoạt động:', error);
          
          // Common fields for all activity types as fallback
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
          
          return of(commonFields);
        })
      );
  }

  createActivityRecord(record: Partial<Activity>): Observable<Activity> {
    return this.createActivity(record);
  }

  updateActivityRecord(id: string, record: Partial<Activity>): Observable<Activity> {
    return this.updateActivity(id, record);
  }

  /**
   * Lấy danh sách activities từ API với bộ lọc
   * @param filters Bộ lọc (employeeIds, activityType, activityStatus, startTime, endTime)
   */
  getActivitiesByFilter(filters: {
    employeeIds?: string;
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
       
        catchError(error => {
          console.error('❌ Lỗi khi tải dữ liệu phòng ban:', error);
          return of([]);
        })
      );
  }
} 