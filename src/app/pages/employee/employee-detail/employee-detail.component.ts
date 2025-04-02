import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
  employeeForm: FormGroup;
  employeeId: string;
  isEditMode = false;
  departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales'];
  genders = ['Nam', 'Nữ'];
  statuses = ['Đang làm việc', 'Đã nghỉ việc', 'Tạm nghỉ'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {
    this.employeeForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      department: ['', Validators.required],
      position: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.loadEmployeeData();
  }

  loadEmployeeData() {
    this.employeeService.getEmployeeById(this.employeeId).subscribe(
      (data) => {
        if (data) {
          this.employeeForm.patchValue(data);
        }
      },
      (error) => {
        console.error('Error loading employee data:', error);
      }
    );
  }

  onEdit() {
    this.isEditMode = true;
  }

  onSave() {
    if (this.employeeForm.valid) {
      this.employeeService.updateEmployee(this.employeeId, this.employeeForm.value).subscribe(
        (data) => {
          this.isEditMode = false;
          // Show success message
        },
        (error) => {
          console.error('Error updating employee:', error);
          // Show error message
        }
      );
    }
  }

  onCancel() {
    this.isEditMode = false;
    this.loadEmployeeData();
  }

  onBack() {
    this.router.navigate(['/employee']);
  }
} 