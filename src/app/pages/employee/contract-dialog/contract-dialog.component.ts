import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contract-dialog',
  template: './contract-dialog.component.html',
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
      contractNumber: ['', Validators.required],
      contractType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      salaryIndex: ['', Validators.required],
      salaryBase: ['', Validators.required],
      position: ['', Validators.required],
      contractUrl: [''],
      status: ['', Validators.required]
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