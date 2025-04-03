import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalaryDetailComponent } from '../salary-detail/salary-detail.component';

@Component({
  selector: 'app-salary-list',
  templateUrl: './salary-list.component.html',
  styleUrls: ['./salary-list.component.scss']
})
export class SalaryListComponent implements OnInit {
  filterForm: FormGroup;
  employees: any[] = [
    {
      id: 1,
      code: 'NV001',
      name: 'Nguyễn Văn A',
      department: 'Phòng Kế Toán',
      position: 'Kế Toán Viên',
      baseSalary: 8000000
    },
    {
      id: 2,
      code: 'NV002',
      name: 'Trần Thị B',
      department: 'Phòng Nhân Sự',
      position: 'Chuyên Viên Nhân Sự',
      baseSalary: 10000000
    },
    {
      id: 3,
      code: 'NV003',
      name: 'Lê Văn C',
      department: 'Phòng IT',
      position: 'Lập Trình Viên',
      baseSalary: 15000000
    }
  ];
  departments: any[] = [
    { id: 1, name: 'Phòng Kế Toán' },
    { id: 2, name: 'Phòng Nhân Sự' },
    { id: 3, name: 'Phòng IT' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.filterForm = this.fb.group({
      department: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    // Load initial data
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees(): void {
    // TODO: Implement API call to load employees
    // For now using sample data
  }

  loadDepartments(): void {
    // TODO: Implement API call to load departments
    // For now using sample data
  }

  viewSalaryDetails(employee: any): void {
    const modalRef = this.modalService.open(SalaryDetailComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.employee = employee;
  }

  applyFilter(): void {
    // TODO: Implement filtering logic
    console.log('Filter form:', this.filterForm.value);
  }
} 