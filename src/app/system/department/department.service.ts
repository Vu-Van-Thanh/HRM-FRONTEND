import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from './department.model';
import { ApiResponse } from 'src/app/core/models/kafkaresponse.model';
import { environment } from '../../../environments/environment';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { map, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiBaseUrl}/departments`;

  constructor(private http: HttpClient) { }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(API_ENDPOINT.getAllDepartment).pipe(
      map(departments => departments.map((dep,index) => this.mapDepartmentResponse(dep,index))),
    );
    //return this.http.get<Department[]>(this.apiUrl);
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<ApiResponse<Department>>(`${API_ENDPOINT.getAllDepartment}/${id}`).pipe(
      map(response => {
        const raw = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log('📦 Extracted department object:', raw);
        return raw;
      }),
      map(department => this.mapDepartmentResponse(department,0)),
      tap(mapped => console.log('Mapped Department data:', mapped))
    );
    //return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department);
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  private mapDepartmentResponse(department: any,index: number): Department {
    return {
      id: index + 1,
      name: department.departmentName,
      code: department.departmentId,
      contact: department.contact,
      description: department.description,
      managerName: department.manager,
      status: true,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      managerId: department.managerId,
    };
  }
} 