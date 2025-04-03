import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Department } from './department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private mockDepartments: Department[] = [
    {
      id: 1,
      name: 'Phòng Kinh Doanh',
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

  constructor() { }

  getDepartments(): Observable<Department[]> {
    return of(this.mockDepartments);
  }

  getDepartmentById(id: number): Observable<Department> {
    const department = this.mockDepartments.find(d => d.id === id);
    return of(department);
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
} 