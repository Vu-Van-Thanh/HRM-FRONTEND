import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contract-dialog',
  template: `
    <h2 mat-dialog-title>{{data.contract ? 'Chỉnh sửa' : 'Thêm'}} hợp đồng</h2>
    <form [formGroup]="contractForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Số hợp đồng</mat-label>
            <input matInput formControlName="contractNo" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Loại hợp đồng</mat-label>
            <mat-select formControlName="type" required>
              <mat-option *ngFor="let type of contractTypes" [value]="type">
                {{type}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ngày bắt đầu</mat-label>
            <input matInput [matDatepicker]="startDatePicker" formControlName="startDate" required>
            <mat-datepicker-toggle matSuffix [for]="startDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #startDatePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ngày kết thúc</mat-label>
            <input matInput [matDatepicker]="endDatePicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #endDatePicker></mat-datepicker>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Hủy</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!contractForm.valid">
          {{data.contract ? 'Cập nhật' : 'Thêm'}}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class ContractDialogComponent implements OnInit {
  contractForm: FormGroup;
  contractTypes = ['Hợp đồng không xác định thời hạn', 'Hợp đồng xác định thời hạn', 'Hợp đồng thử việc'];

  constructor(
    private dialogRef: MatDialogRef<ContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employeeId: string, contract?: any },
    private fb: FormBuilder
  ) {
    this.contractForm = this.fb.group({
      contractNo: ['', Validators.required],
      type: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['']
    });
  }

  ngOnInit() {
    if (this.data.contract) {
      this.contractForm.patchValue(this.data.contract);
    }
  }

  onSubmit() {
    if (this.contractForm.valid) {
      this.dialogRef.close(this.contractForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 