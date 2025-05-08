import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InternalInfo } from '../models/internal-info.model';
import { InternalInfoService } from '../services/internal-info.service';
import { Observable } from 'rxjs';
import { Department } from 'src/app/system/department/department.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

@Component({
  selector: 'app-internal-info-form-dialog',
  templateUrl: './internal-info-form-dialog.component.html',
  styleUrls: ['./internal-info-form-dialog.component.scss']
})
export class InternalInfoFormDialogComponent implements OnInit {
  form: FormGroup;
  departments: Department[] = [];
  isEdit: boolean = false;
  selectedFile: File | null = null;
  fileName: string = '';
  isUploading: boolean = false;
  uploadProgress: number = 0;

  constructor(
    private fb: FormBuilder,
    private internalInfoService: InternalInfoService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<InternalInfoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      info?: InternalInfo; 
      isEdit: boolean;
      departments?: Department[];
    }
  ) {
    this.isEdit = data.isEdit;
    if (data.departments) {
      this.departments = data.departments;
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEdit && this.data.info) {
      this.form.patchValue({
        title: this.data.info.title,
        content: this.data.info.content,
        departmentId: this.data.info.departmentId,
        isActive: this.data.info.isActive
      });
      
      if (this.data.info.documentId) {
        this.fileName = `Document ID: ${this.data.info.documentId}`;
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      departmentId: ['', Validators.required],
      isActive: [true]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      
      // Check if file is a Word document
      if (!this.fileName.endsWith('.docx')) {
        alert('Vui lòng chọn file Word (.docx)');
        this.selectedFile = null;
        this.fileName = '';
        input.value = '';
      }
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.isEdit && this.data.info) {
        // Handle edit mode
        const formData = this.form.value;
        this.internalInfoService.updateInternalInfo(this.data.info.id, formData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating internal info:', error);
            alert('Lỗi khi cập nhật thông tin. Vui lòng thử lại.');
          }
        });
      } else if (this.selectedFile) {
        // Handle create mode with file upload
        this.uploadFile();
      } else {
        alert('Vui lòng chọn file Word (.docx) để tải lên');
      }
    }
  }
  
  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Vui lòng chọn file Word (.docx) để tải lên');
      return;
    }
    
    const formData = new FormData();
    formData.append('formFile', this.selectedFile);
    formData.append('Title', this.form.get('title').value);
    formData.append('DepartmentID', this.form.get('departmentId').value);
    
    this.isUploading = true;
    this.uploadProgress = 0;
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 300);
    
    this.http.post(API_ENDPOINT.uploadArticle, formData).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        console.log('✅ Upload successful:', response);
        this.isUploading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        clearInterval(progressInterval);
        console.error('❌ Error uploading file:', error);
        this.isUploading = false;
        alert('Lỗi khi tải lên file. Vui lòng thử lại.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 