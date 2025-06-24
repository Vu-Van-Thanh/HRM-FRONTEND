import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../employee.service';
import { EmployeeDetailDialogComponent } from '../employee-detail-dialog/employee-detail-dialog.component';
import { Employee } from '../employee.model';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import {ToastService} from 'angular-toastify';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'code', 'fullName', 'departmentName', 'positionName', 'email', 'phone', 'actions'];
  dataSource: MatTableDataSource<Employee>;
  loadingIndicator = false;
  filterText = '';
  selectedDepartment = '';
  selectedGender = '';
  selectedStatus = '';
  departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Customer Service'];
  genders = ['Nam', 'Nữ'];
  statuses = ['Đang làm việc', 'Nghỉ việc', 'Tạm nghỉ'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private toastService : ToastService,
    private http: HttpClient
  ) {
    console.log('EmployeeListComponent constructor');
    this.dataSource = new MatTableDataSource<Employee>();
  }

  ngOnInit() {
    console.log('EmployeeListComponent ngOnInit');
    this.loadEmployees();
  }

  ngAfterViewInit() {
    console.log('EmployeeListComponent ngAfterViewInit');
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEmployees() {
    console.log('Loading employees...');
    this.loadingIndicator = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        console.log('Employees loaded:', data);
        this.dataSource.data = data;
        this.loadingIndicator = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loadingIndicator = false;
        this.showErrorMessage('Không thể tải dữ liệu nhân viên');
      }
    });
  }

  onFilter() {
    this.loadingIndicator = true;
    this.employeeService.searchEmployees(this.filterText).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loadingIndicator = false;
      },
      error: (error) => {
        console.error('Error filtering employees:', error);
        this.loadingIndicator = false;
        this.showErrorMessage('Không thể lọc dữ liệu nhân viên');
      }
    });
  }

  onResetFilter() {
    this.filterText = '';
    this.selectedDepartment = '';
    this.selectedGender = '';
    this.selectedStatus = '';
    this.loadEmployees();
  }

  onViewDetail(code: string) {
    console.log('code:', code);
    const employee = this.dataSource.data.find(emp => emp.code === code);
    console.log('Employee:', employee);
    
    const dialogRef = this.dialog.open(EmployeeDetailDialogComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: { code, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    console.log('Đã chọn file:', file.name);

    const formData = new FormData();
    formData.append('formFile', file); // 👈 Phải đặt đúng tên biến trùng với tên param ở backend: "formFile"

    this.http.post(API_ENDPOINT.importEmployee, formData).subscribe({
      next: (response) => {
        console.log('File imported successfully:', response);
        this.showSuccessMessage('Import file thành công');
        this.toastService.success('Import file thành công');
        this.loadEmployees(); 
      },
      error: (error) => {
        console.error('Import thất bại:', error);
        this.showErrorMessage('Import thất bại');
        this.toastService.error('Import thất bại');
      }
    });
  }
}

onFileMultiSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    console.log('Đã chọn file:', file.name);

    const formData = new FormData();
    formData.append('file', file); 

    this.http.post(API_ENDPOINT.importFromOrches, formData).subscribe({
      next: (response) => {
        console.log('File imported successfully:', response);
        this.showSuccessMessage('Import file thành công');
        this.toastService.success('Import file thành công');
        this.loadEmployees(); 
      },
      error: (error) => {
        console.error('Import thất bại:', error);
        this.showErrorMessage('Import thất bại');
        this.toastService.error('Import thất bại');
      }
    });
  }
}

  onEdit(id: number) {
    const employee = this.dataSource.data.find(emp => emp.id === id);
    if (!employee) {
      this.showErrorMessage('Không tìm thấy thông tin nhân viên');
      return;
    }
    const safeEmployee = {
      ...employee,
      emergencyContact: employee?.emergencyContact || '',
      emergencyPhone: employee?.emergencyPhone || ''
    };
    console.log('safeEmployee:', safeEmployee);
    const dialogRef = this.dialog.open(EmployeeDetailDialogComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: { 
        id, 
        isEdit: true,
        safeEmployee
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
        this.showSuccessMessage('Cập nhật thông tin nhân viên thành công');
      }
    });
  }

  onDelete(id: number) {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?');
    if (confirmDelete) {
      this.loadingIndicator = true;
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadingIndicator = false;
          this.showSuccessMessage('Xóa nhân viên thành công');
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.loadingIndicator = false;
          this.showErrorMessage('Không thể xóa nhân viên');
        }
      });
    }
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
} 