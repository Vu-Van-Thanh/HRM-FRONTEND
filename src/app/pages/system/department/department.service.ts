import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Department } from './department.model';
import { ApiResponse } from 'src/app/core/models/kafkaresponse.model';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private mockDepartments: Department[] = [
    {
      id: 1,
      name: 'Phòng Kinh Doanh',
      contact: '0909090909',
      code: 'KD',
      description: 'Phụ trách các hoạt động kinh doanh và phát triển thị trường',
      managerId: 1,
      managerName: 'Nguyễn Văn A',
      parentId: null,
      parentName: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'Phòng Kỹ Thuật',
      contact: '0909090909',
      code: 'KT',
      description: 'Phụ trách phát triển và bảo trì hệ thống',
      managerId: 2,
      managerName: 'Trần Thị B',
      parentId: null,
      parentName: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      name: 'Phòng Nhân Sự',
      contact: '0909090909',
      code: 'NS',
      description: 'Quản lý nhân sự và đào tạo',
      managerId: 3,
      managerName: 'Lê Văn C',
      parentId: null,
      parentName: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      name: 'Phòng Tài Chính',
      contact: '0909090909',
      code: 'TC',
      description: 'Quản lý tài chính và kế toán',
      managerId: 4,
      managerName: 'Phạm Thị D',
      parentId: null,
      parentName: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(private http: HttpClient) { }

  getDepartments(): Observable<Department[]> {
    return this.http.get<ApiResponse<Department[]>>(API_ENDPOINT.getAllDepartment).pipe(
      tap(response => console.log('Raw data from API get all department:', response)),
      map(response => response.data),
      map(departments => departments.map((dep,index) => this.mapDepartmentResponse(dep,index))),
      tap(mapped => console.log('Mapped Department data:', mapped))
    );
    //return of(this.mockDepartments);
  }

  getDepartmentById(code: string): Observable<Department> {
    return this.http.get<ApiResponse<Department>>(`${API_ENDPOINT.getAllDepartment}/${code}`).pipe(
      tap(data => console.log('Raw data from API get department by id:', data)), 
      map(response => {
        const raw = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log('📦 Extracted department object:', raw);
        return raw;
      }),
      map(department => this.mapDepartmentResponse(department,0)),
      tap(mapped => console.log('Mapped Department data:', mapped))
    );
    //const department = this.mockDepartments.find(d => d.id === id);
    //return of(department);
  }

  createDepartment(department: Department): Observable<Department> {
    const newDepartment = {
      ...department,
      id: this.mockDepartments.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockDepartments.push(newDepartment);
    return of(newDepartment);
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    const index = this.mockDepartments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.mockDepartments[index] = {
        ...department,
        id,
        updatedAt: new Date()
      };
      return of(this.mockDepartments[index]);
    }
    return of(null);
  }

  deleteDepartment(id: number): Observable<boolean> {
    const index = this.mockDepartments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.mockDepartments.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
  private mapDepartmentResponse(department: any,index: number): Department {
    return {
      id: index + 1,
      name: department.departmentName,
      code: department.departmentId,
      contact: department.contact,
      description: department.description,
      managerName: department.anager,
      status: true,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      managerId: department.managerId,
      parentId: department.parentId,
      parentName: department.parentName
    };
  }
} 