import { Component,OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {
  previewImages: { [key: string]: string | ArrayBuffer | null } = {};
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
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getEmployeeData();
  }

  getEmployeeData() {
    this.http.get('assets/data/employee.json').subscribe((data) => {
      this.employee = data;
    });
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
