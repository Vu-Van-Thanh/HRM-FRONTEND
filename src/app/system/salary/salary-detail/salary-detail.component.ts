import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SalaryInfo, AdjustmentResult } from '../salary.model';

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
  others: any[] = [];
  nextId = 1;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.salaryForm = this.fb.group({
      baseSalary: ['', Validators.required],
      allowances: [[]],
      deductions: [[]],
      others: [[]],
      totalSalary: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    if (this.employee) {
      this.loadSalaryDetails();
    }
  }

  loadSalaryDetails(): void {
    console.log('Loading salary details with data:', this.employee);
    
    // Cập nhật lương cơ bản
    this.salaryForm.patchValue({
      baseSalary: this.employee.baseSalary || this.employee.salaryBase?.baseSalary || 0
    });

    // Xử lý các khoản điều chỉnh từ SalaryInfo
    if (this.employee.adjustments && this.employee.adjustments.length > 0) {
      // Reset các mảng hiện tại
      this.deductions = [];
      this.allowances = [];
      this.others = [];
      
      // Log để xem giá trị adjustType thực tế
      console.log('Các adjustType trong dữ liệu:', this.employee.adjustments.map(a => a.adjustType));
      
      // Phân loại các khoản điều chỉnh theo adjustType, không phân biệt chữ hoa/chữ thường
      this.employee.adjustments.forEach((adjustment: AdjustmentResult) => {
        const adjustmentAmount = adjustment.resultAmount || adjustment.amount || 0;
        const adjustType = adjustment.adjustType?.toUpperCase() || '';
        
        if (adjustType.includes('DEDUCTION') || adjustType === 'TRỪLƯƠNG' || adjustType === 'TRỪ') {
          this.deductions.push({
            id: this.nextId++,
            name: adjustment.adjustmentName || 'Khấu trừ',
            amount: Math.abs(adjustmentAmount),
            percentage: adjustment.percentage || 0,
            adjustmentId: adjustment.adjustmentId,
            adjustType: adjustment.adjustType
          });
        } else if (adjustType.includes('BONUS') || adjustType.includes('ALLOW') || adjustType === 'THƯỞNG' || adjustType === 'PHỤ CẤP') {
          this.allowances.push({
            id: this.nextId++,
            name: adjustment.adjustmentName || 'Phụ cấp',
            amount: adjustmentAmount,
            percentage: adjustment.percentage || 0,
            adjustmentId: adjustment.adjustmentId,
            adjustType: adjustment.adjustType
          });
        } else {
          // Nếu không thể phân loại, xác định loại dựa trên giá trị
          if (adjustmentAmount < 0) {
            this.deductions.push({
              id: this.nextId++,
              name: adjustment.adjustmentName || 'Khấu trừ',
              amount: Math.abs(adjustmentAmount),
              percentage: adjustment.percentage || 0,
              adjustmentId: adjustment.adjustmentId,
              adjustType: 'DEDUCTION'
            });
          } else {
            this.allowances.push({
              id: this.nextId++,
              name: adjustment.adjustmentName || 'Phụ cấp',
              amount: adjustmentAmount,
              percentage: adjustment.percentage || 0,
              adjustmentId: adjustment.adjustmentId,
              adjustType: 'BONUS'
            });
          }
        }
      });
    }
    
    this.calculateTotal();
  }

  addDeduction(): void {
    this.deductions.push({
      id: this.nextId++,
      name: '',
      amount: 0,
      percentage: 0,
      adjustType: 'DEDUCTION'
    });
    this.calculateTotal();
  }

  addBonus(): void {
    this.allowances.push({
      id: this.nextId++,
      name: '',
      amount: 0,
      percentage: 0,
      adjustType: 'BONUS'
    });
    this.calculateTotal();
  }

  addOther(): void {
    this.others.push({
      id: this.nextId++,
      name: '',
      amount: 0,
      percentage: 0,
      adjustType: 'OTHER'
    });
    this.calculateTotal();
  }

  removeDeduction(id: number): void {
    this.deductions = this.deductions.filter(d => d.id !== id);
    this.calculateTotal();
  }

  removeAllowance(id: number): void {
    this.allowances = this.allowances.filter(a => a.id !== id);
    this.calculateTotal();
  }

  removeOther(id: number): void {
    this.others = this.others.filter(o => o.id !== id);
    this.calculateTotal();
  }

  calculatePercentage(item: any): void {
    // Khi người dùng thay đổi amount, tính lại percentage
    const baseSalary = this.salaryForm.get('baseSalary')?.value || 1;
    if (baseSalary > 0) {
      // Đặt giá trị percentage mới dựa trên amount và baseSalary
      item.percentage = ((parseFloat(item.amount) / baseSalary) * 100).toFixed(2);
    }
  }

  calculateAmountFromPercentage(item: any): void {
    // Khi người dùng thay đổi percentage, tính lại amount
    const baseSalary = this.salaryForm.get('baseSalary')?.value || 0;
    if (baseSalary > 0) {
      // Đặt giá trị amount mới dựa trên percentage và baseSalary
      item.amount = Math.round(baseSalary * parseFloat(item.percentage) / 100);
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    const baseSalary = this.salaryForm.get('baseSalary')?.value || 0;
    const totalAllowances = this.allowances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const totalDeductions = this.deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const totalOthers = this.others.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
    
    this.salaryForm.patchValue({
      totalSalary: baseSalary + totalAllowances - totalDeductions + totalOthers
    });
  }

  saveSalaryDetails(): void {
    if (this.salaryForm.valid) {
      // Tạo đối tượng kết quả bao gồm cả dữ liệu gốc và dữ liệu đã chỉnh sửa
      const result = {
        employeeId: this.employee.employeeId,
        salaryBase: {
          ...this.employee.salaryBase,
          baseSalary: this.salaryForm.get('baseSalary')?.value
        },
        adjustments: [
          ...this.allowances.map(a => ({
            adjustmentId: a.adjustmentId || '',
            baseId: this.employee.salaryBase?.salaryId || '',
            adjustType: a.adjustType,
            adjustmentName: a.name,
            amount: parseFloat(a.amount),
            percentage: parseFloat(a.percentage),
            resultAmount: parseFloat(a.amount)
          })),
          ...this.deductions.map(d => ({
            adjustmentId: d.adjustmentId || '',
            baseId: this.employee.salaryBase?.salaryId || '',
            adjustType: d.adjustType,
            adjustmentName: d.name,
            amount: parseFloat(d.amount),
            percentage: parseFloat(d.percentage),
            resultAmount: -parseFloat(d.amount)
          })),
          ...this.others.map(o => ({
            adjustmentId: o.adjustmentId || '',
            baseId: this.employee.salaryBase?.salaryId || '',
            adjustType: o.adjustType,
            adjustmentName: o.name,
            amount: parseFloat(o.amount),
            percentage: parseFloat(o.percentage),
            resultAmount: parseFloat(o.amount)
          }))
        ]
      };
      
      this.activeModal.close(result);
    }
  }
} 