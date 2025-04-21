import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Relative } from '../employee.model';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {
  previewImages: { [key: string]: string | ArrayBuffer | null } = {};
  activeTab = 0; // 0: Thông tin cá nhân, 1: Thông tin người thân
  relatives: Relative[] = [];
  newRelative: Relative = {
    name: '',
    relationship: '',
    dateOfBirth: '',
    phone: '',
    address: ''
  };
  
  employee: any = {
    employeeID: '',
    position: '',
    accountID: null,
    departmentID: null,
    firstName: 'thanhca',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    tax: '',
    address: '',
    nationality: 'Việt Nam',
    ethnic: '',
    religion: 'Không',
    placeOfBirth: '',
    indentityCard: '',
    placeIssued: '',
    country: '',
    province: '',
    district: '',
    commune: '',
    insuranceNumber: '',
    employeeMedia: [],
    employeeContract: [],
    tempProvince: '',
    tempAddress: '',
    originProvince: '',
    bankAccount: '',
    bank: '',
    salaryType: '',
    employeeType: ''
  };
  
  relationshipOptions = ['Vợ/Chồng', 'Cha', 'Mẹ', 'Con', 'Anh/Chị', 'Em', 'Khác'];
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getEmployeeData();
    this.loadRelatives();
  }

  getEmployeeData() {
    this.http.get('assets/data/employee.json').subscribe((data) => {
      this.employee = data;
    });
  }
  
  loadRelatives() {
    // Mock data for relatives
    this.relatives = [
      {
        name: 'Nguyễn Văn A',
        relationship: 'Cha',
        dateOfBirth: '1960-01-01',
        phone: '0123456789',
        address: 'Số 123, Đường ABC, Quận 1, TP.HCM'
      },
      {
        name: 'Trần Thị B',
        relationship: 'Mẹ',
        dateOfBirth: '1962-05-15',
        phone: '0987654321',
        address: 'Số 123, Đường ABC, Quận 1, TP.HCM'
      }
    ];
  }
  
  addRelative() {
    if (this.newRelative.name && this.newRelative.relationship) {
      this.relatives.push({...this.newRelative});
      // Reset form
      this.newRelative = {
        name: '',
        relationship: '',
        dateOfBirth: '',
        phone: '',
        address: ''
      };
    }
  }
  
  removeRelative(index: number) {
    this.relatives.splice(index, 1);
  }
  
  onFileChange(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
  
      reader.onload = () => {
        this.previewImages[type] = reader.result;
      };
  
      reader.readAsDataURL(file);
    }
  }
}
