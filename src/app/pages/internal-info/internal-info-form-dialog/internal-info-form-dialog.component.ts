import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InternalInfo } from '../models/internal-info.model';
import { InternalInfoService } from '../services/internal-info.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-internal-info-form-dialog',
  templateUrl: './internal-info-form-dialog.component.html',
  styleUrls: ['./internal-info-form-dialog.component.scss']
})
export class InternalInfoFormDialogComponent implements OnInit {
  form: FormGroup;
  departments: string[] = [];
  isEdit: boolean = false;
  selectedFile: File | null = null;
  fileName: string = '';
  isUploading: boolean = false;
  uploadProgress: number = 0;

  constructor(
    private fb: FormBuilder,
    private internalInfoService: InternalInfoService,
    public dialogRef: MatDialogRef<InternalInfoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { info?: InternalInfo; isEdit: boolean }
  ) {
    this.isEdit = data.isEdit;
    this.departments = this.internalInfoService.getDepartments();
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEdit && this.data.info) {
      this.form.patchValue(this.data.info);
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
      departmentName: ['', Validators.required],
      isActive: [true],
      documentId: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      
      // Check if file is a Word document
      const fileType = this.selectedFile.type;
      if (!fileType.includes('word') && !fileType.includes('doc') && !fileType.includes('docx')) {
        alert('Vui lòng chọn file Word (.doc, .docx)');
        this.selectedFile = null;
        this.fileName = '';
        input.value = '';
      }
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.form.patchValue({ documentId: '' });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      
      if (this.selectedFile) {
        this.isUploading = true;
        this.uploadProgress = 0;
        
        // Simulate file upload with progress
        this.simulateFileUpload().subscribe({
          next: (documentId) => {
            formData.documentId = documentId;
            this.saveInternalInfo(formData);
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            this.isUploading = false;
            alert('Lỗi khi tải lên file. Vui lòng thử lại.');
          }
        });
      } else {
        this.saveInternalInfo(formData);
      }
    }
  }
  
  private simulateFileUpload(): Observable<string> {
    // In a real application, you would use FormData to upload the file
    // const formData = new FormData();
    // formData.append('file', this.selectedFile);
    // return this.internalInfoService.uploadFile(formData);
    
    // For now, we'll simulate the upload with a delay
    return new Observable(observer => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        this.uploadProgress = progress;
        
        if (progress >= 100) {
          clearInterval(interval);
          // Generate a random document ID
          const documentId = 'doc' + Math.floor(Math.random() * 10000);
          observer.next(documentId);
          observer.complete();
        }
      }, 300);
    });
  }
  
  private saveInternalInfo(formData: any): void {
    if (this.isEdit && this.data.info) {
      this.internalInfoService.updateInternalInfo(this.data.info.id, formData).subscribe({
        next: () => {
          this.isUploading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating internal info:', error);
          this.isUploading = false;
          alert('Lỗi khi cập nhật thông tin. Vui lòng thử lại.');
        }
      });
    } else {
      this.internalInfoService.createInternalInfo(formData).subscribe({
        next: () => {
          this.isUploading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating internal info:', error);
          this.isUploading = false;
          alert('Lỗi khi tạo thông tin mới. Vui lòng thử lại.');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 