import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contract } from '../employee-detail-dialog/employee-detail-dialog.component';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { HttpClient } from '@angular/common/http';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-contract-dialog',
  templateUrl: './contract-dialog.component.html',
  styleUrls: ['./contract-dialog.component.scss']
})
export class ContractDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  contractForm: FormGroup;
  OldContractNumber : string = '';
  contractTypes = ['Full-time', 'Part-time', 'Temporary'];
  typeAction : string = 'Edit';
  selectedFile: File | null = null;
  constructor(
    private dialogRef: MatDialogRef<ContractDialogComponent>,
    private http : HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { employeeId: string, typeAction : string,contract?: Contract },
    private fb: FormBuilder,
    private toastService: ToastService
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
      if(this.data.typeAction === 'Edit')
      {
        this.OldContractNumber = this.data.contract.contractNumber;
      }
    }
    this.typeAction = this.data.typeAction;
  }

  onSubmit() {
    if (this.contractForm.valid) {
      const data = this.contractForm.value;
      const formData = new FormData();
  
      // Format dates to ISO string
      const formatDate = (date: Date) => {
        if (!date) return null;
        return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      };
      formData.append('EmployeeId', this.data.employeeId);
      formData.append('ContractNumber', data.contractNumber);
      formData.append('ContractType', data.contractType);
      formData.append('StartDate', formatDate(data.startDate));
      formData.append('EndDate', formatDate(data.endDate));
      formData.append('SalaryIndex', data.salaryIndex);
      formData.append('SalaryBase', data.salaryBase);
      formData.append('Position', data.position);
      formData.append('Status', 'Active');
      formData.append('OldContractNumber', this.OldContractNumber);
      if (this.selectedFile) {
        formData.append('contractFile', this.selectedFile); 
      }
      this.http.post<{message : string}>(`${API_ENDPOINT.uploadContract}`,formData).subscribe(
        (response) => {
          this.toastService.info(response.message);
          this.dialogRef.close(response.message); 
        },
        (error) => {
          console.error('Upload failed:', error);
        }
      );
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
} 