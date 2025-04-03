import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-salary-detail',
  templateUrl: './salary-detail.component.html',
  styleUrls: ['./salary-detail.component.scss']
})
export class SalaryDetailComponent implements OnInit {
  @Input() employee: any;
  salaryForm: FormGroup;
  deductions: any[] = [];
  allowances: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.salaryForm = this.fb.group({
      baseSalary: ['', Validators.required],
      allowances: [[]],
      deductions: [[]],
      totalSalary: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    if (this.employee) {
      this.loadSalaryDetails();
    }
  }

  loadSalaryDetails(): void {
    // TODO: Implement API call to load salary details
    this.salaryForm.patchValue({
      baseSalary: this.employee.baseSalary
    });
    this.calculateTotal();
  }

  addDeduction(): void {
    this.deductions.push({
      id: Date.now(),
      name: '',
      amount: 0
    });
  }

  addAllowance(): void {
    this.allowances.push({
      id: Date.now(),
      name: '',
      amount: 0
    });
  }

  removeDeduction(id: number): void {
    this.deductions = this.deductions.filter(d => d.id !== id);
    this.calculateTotal();
  }

  removeAllowance(id: number): void {
    this.allowances = this.allowances.filter(a => a.id !== id);
    this.calculateTotal();
  }

  calculateTotal(): void {
    const baseSalary = this.salaryForm.get('baseSalary')?.value || 0;
    const totalAllowances = this.allowances.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalDeductions = this.deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    this.salaryForm.patchValue({
      totalSalary: baseSalary + totalAllowances - totalDeductions
    });
  }

  saveSalaryDetails(): void {
    if (this.salaryForm.valid) {
      // TODO: Implement API call to save salary details
      this.activeModal.close(this.salaryForm.value);
    }
  }
} 