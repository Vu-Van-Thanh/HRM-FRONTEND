import { Component, OnInit } from '@angular/core';
import { Department } from './department.model';
import { DepartmentService } from './department.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  departmentForm: FormGroup;
  isEditing = false;
  selectedDepartment: Department | null = null;

  constructor(
    private departmentService: DepartmentService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.departmentForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      managerId: [null],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe(
      departments => this.departments = departments,
      error => console.error('Error loading departments:', error)
    );
  }

  openModal(content: any, department?: Department): void {
    this.isEditing = !!department;
    if (department) {
      this.selectedDepartment = department;
      this.departmentForm.patchValue(department);
    } else {
      this.selectedDepartment = null;
      this.departmentForm.reset();
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      const departmentData = this.departmentForm.value;
      if (this.isEditing && this.selectedDepartment) {
        this.departmentService.updateDepartment(this.selectedDepartment.id, departmentData).subscribe(
          () => {
            this.modalService.dismissAll();
            this.loadDepartments();
          },
          error => console.error('Error updating department:', error)
        );
      } else {
        this.departmentService.createDepartment(departmentData).subscribe(
          () => {
            this.modalService.dismissAll();
            this.loadDepartments();
          },
          error => console.error('Error creating department:', error)
        );
      }
    }
  }

  deleteDepartment(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
      this.departmentService.deleteDepartment(id).subscribe(
        () => this.loadDepartments(),
        error => console.error('Error deleting department:', error)
      );
    }
  }
} 