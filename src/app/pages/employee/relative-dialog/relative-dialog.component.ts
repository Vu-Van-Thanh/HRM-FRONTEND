import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Relative } from '../employee.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-relative-dialog',
  templateUrl: './relative-dialog.component.html',
})
export class RelativeDialogComponent implements OnInit {
  relativeForm: FormGroup;
  OldID: string = '';
  typeAction : string = 'Edit';
  relationships = ['Vợ/Chồng', 'Cha', 'Mẹ', 'Con', 'Anh/Chị', 'Em', 'Khác'];

  constructor(
    private dialogRef: MatDialogRef<RelativeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employeeId: string, typeAction : string,relative?: Relative },
    private fb: FormBuilder,
    private http : HttpClient,
    private toastService: ToastService
  ) {
    this.relativeForm = this.fb.group({
      name: [''],
      firstName: [''],
      lastName: [''],
      relationship: [''],
      relativeType: [''],
      dateOfBirth: [''],
      phone: [''],
      phoneNumber: [''],
      address: [''],
      nationality: [''],
      ethnic: [''],
      religion: [''],
      placeOfBirth: [''],
      indentityCard: [''],
      country: [''],
      province: [''],
      district: [''],
      commune: [''],
      employeeID: [this.data.employeeId] // hoặc null nếu không có
    });    
  }

  ngOnInit() {
    if (this.data.relative) {
      this.relativeForm.patchValue(this.data.relative);
    }
    if(this.data.typeAction === 'Edit')
    {
      this.OldID = this.data.relative.indentityCard || ''; 
    }
    this.typeAction = this.data.typeAction;
  }

  onSubmit() {

    const relativeData: Relative = this.relativeForm.value;
    const relative = {
      EmployeeID : this.data.employeeId,
      FirstName: relativeData.firstName,
      LastName: relativeData.lastName,
      RelativeType: relativeData.relationship,
      DateOfBirth: relativeData.dateOfBirth,
      Address : relativeData.address,
      Nationality  : relativeData.nationality,
      Ethnic : relativeData.ethnic,
      Religion : relativeData.religion,
      PlaceOfBirth : relativeData.placeOfBirth,
      IndentityCard : relativeData.indentityCard,
      Country : relativeData.country,
      Province : relativeData.province,
      District : relativeData.district,
      Commune : relativeData.commune,
      PhoneNumber : relativeData.phone,
      OldID : this.OldID
    }
    this.http.post(API_ENDPOINT.updateRelative, relative).subscribe({
      next: (response) => {
        console.log('Relative updated successfully', response);
        if(this.typeAction === 'Edit')
        {
          this.toastService.success('Cập nhật thông tin người thân thành công!');
        }
        else
        {
          this.toastService.success('Thêm mới người thân thành công!');
        }
      },
      error: (error) => {
        console.error('Error updating relative', error);
      }
    });
    if (this.relativeForm.valid) {
      this.dialogRef.close(this.relativeForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 