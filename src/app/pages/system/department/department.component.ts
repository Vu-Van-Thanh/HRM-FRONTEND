import { Component, OnInit } from '@angular/core';
import { DepartmentService } from './department.service';
import { Department } from './department.model';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  error: string | null = null;
  breadCrumbItems: Array<{}>;
  searchParams = {
    keyword: '',
    status: null,
    page: 1,
    pageSize: 10
  };

  constructor(private departmentService: DepartmentService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Quản trị hệ thống' }, { label: 'Quản lý phòng ban', active: true }];
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.error = null;
    
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Có lỗi xảy ra khi tải dữ liệu';
        this.loading = false;
        console.error('Error loading departments:', error);
      }
    });
  }

  onSearch(): void {
    this.loadDepartments();
  }

  onReset(): void {
    this.searchParams = {
      keyword: '',
      status: null,
      page: 1,
      pageSize: 10
    };
    this.loadDepartments();
  }

  onDelete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: (success) => {
          if (success) {
            this.loadDepartments();
          }
        },
        error: (error) => {
          console.error('Error deleting department:', error);
        }
      });
    }
  }

  getStatusClass(status: boolean): string {
    return status ? 'success' : 'danger';
  }
}
