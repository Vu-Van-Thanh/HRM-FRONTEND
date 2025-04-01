import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/core/services/system.service';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  
  // Filter properties
  departments: any[] = [];
  selectedDepartment: string = '';
  selectedTemplate: string = '';
  
  // Employee list
  employees: any[] = [];
  selectedEmployees: any[] = [];
  
  // Email templates
  emailTemplates = [
    { id: 1, name: 'Thông báo chung' },
    { id: 2, name: 'Thông báo nghỉ lễ' },
    { id: 3, name: 'Thông báo họp' },
    { id: 4, name: 'Thông báo đánh giá' }
  ];

  constructor(private systemService: SystemService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Email' }, { label: 'Tạo email', active: true }];
    this.loadDepartments();
  }

  loadDepartments() {
    this.systemService.getDepartmentPaging({ pageIndex: 1, pageSize: 100 }).subscribe((result: any) => {
      if (result.isSuccess) {
        this.departments = result.data.items;
      }
    });
  }

  onDepartmentChange() {
    // Load employees based on selected department
    // This will be implemented when we have the employee API
    this.employees = [];
    this.selectedEmployees = [];
  }

  isSelected(employee: any): boolean {
    return this.selectedEmployees.some(e => e.id === employee.id);
  }

  onEmployeeSelect(employee: any) {
    const index = this.selectedEmployees.findIndex(e => e.id === employee.id);
    if (index === -1) {
      this.selectedEmployees.push(employee);
    } else {
      this.selectedEmployees.splice(index, 1);
    }
  }

  removeEmployee(employee: any) {
    const index = this.selectedEmployees.findIndex(e => e.id === employee.id);
    if (index !== -1) {
      this.selectedEmployees.splice(index, 1);
    }
  }

  sendEmail() {
    // Implement email sending logic here
    console.log('Sending email to:', this.selectedEmployees);
    console.log('Using template:', this.selectedTemplate);
  }
} 