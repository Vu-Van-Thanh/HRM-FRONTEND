import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance } from './attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'api/attendance'; // TODO: Replace with actual API URL

  constructor(private http: HttpClient) { }

  getAttendanceList(managerId: string): Observable<Attendance[]> {
    // TODO: Replace with actual API call
    return this.http.get<Attendance[]>(`${this.apiUrl}/manager/${managerId}`);
  }

  getAttendanceDetail(id: string): Observable<Attendance> {
    // TODO: Replace with actual API call
    return this.http.get<Attendance>(`${this.apiUrl}/${id}`);
  }

  approveAttendance(id: string): Observable<Attendance> {
    // TODO: Replace with actual API call
    return this.http.put<Attendance>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectAttendance(id: string): Observable<Attendance> {
    // TODO: Replace with actual API call
    return this.http.put<Attendance>(`${this.apiUrl}/${id}/reject`, {});
  }
} 