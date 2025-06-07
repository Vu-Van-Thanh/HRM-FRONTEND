import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Relative } from '../employee.model';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { EmployeeService } from '../employee.service';
import { LocalStorage } from 'src/app/core/enums/local-storage.enum';

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
    firstName: '',
    lastName: '',
    relativeType: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    nationality: 'Việt Nam',
    ethnic: 'Kinh',
    religion: 'Không',
    placeOfBirth: '',
    indentityCard: '',
    country: 'Việt Nam',
    province: '',
    district: '',
    commune: ''
  };
  
  employee: any = {
    employeeID: '',
    position: '',
    accountID: null,
    departmentID: null,
    firstName: '',
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
    employeeType: '',
    phone: '',
    email: ''
  };
  
  relationshipOptions = ['Vợ/Chồng', 'Cha', 'Mẹ', 'Con', 'Anh/Chị/Em', 'Anh trai', 'Chị gái', 'Em trai', 'Em gái', 'Khác'];
  isLoading = false;
  
  constructor(
    private http: HttpClient,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.getEmployeeData();
  }

  getEmployeeData() {
    this.isLoading = true;
    
    // Get employeeID from localStorage
    const userProfileString = localStorage.getItem('currentUserProfile');
    if (userProfileString) {
      const userProfile = JSON.parse(userProfileString);
      const employeeId = userProfile.employeeID;
      
      if (employeeId) {
        // Create filter with just employeeId
        const filter = {
          department: null,
          jobTitle: null,
          managerId: null,
          employeeId: employeeId
        };
        
        // Call the API with the filter
        this.http.post<any>(API_ENDPOINT.getAllEmployee, filter).subscribe({
          next: (response) => {
            if (response && response.data && response.data.length > 0) {
              const employeeData = response.data[0];
              
              // Format date for employee
              if (employeeData.dateOfBirth) {
                const date = new Date(employeeData.dateOfBirth);
                employeeData.dateOfBirth = this.formatDateForInput(date);
              }
              
              this.employee = employeeData;
              console.log('Employee data loaded:', this.employee);
              this.loadRelatives(employeeId);
            } else {
              console.error('No employee data returned');
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching employee data:', error);
            this.isLoading = false;
          }
        });
      } else {
        console.error('No employee ID found in user profile');
        this.isLoading = false;
      }
    } else {
      console.error('No user profile found in localStorage');
      this.isLoading = false;
    }
  }
  
  UpdateInfo(){
    const employeeUpdate = {
      EmployeeID : JSON.parse(localStorage.getItem('currentUserProfile'))?.employeeID || '',
      ManagerID : this.employee.managerID,
      Position: this.employee.position,
      FirstName : this.employee.firstName,
      LastName : this.employee.lastName,
      Gender : '',
      Tax : this.employee.tax,
      Nationality : this.employee.nationality,
      Ethnic : this.employee.ethnic,
      Religion : this.employee.religion,
      PlaceOfBirth : this.employee.placeOfBirth,
      DateOfBirth : this.employee.dateOfBirth,
      IndentityCard : this.employee.indentityCard,
      PlaceIssued : this.employee.placeIssued,
      Phone : this.employee.phone,
      Email : this.employee.email,
      Country : this.employee.country,
      Province : this.employee.province,
      District : this.employee.district,
      Commune : this.employee.commune,
      Address : this.employee.address,
      InsuranceNumber: this.employee.insuranceNumber,
      DepartmentID: this.employee.departmentID,
    }

  }
  // Format date to YYYY-MM-DD for input fields
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  loadRelatives(employeeId: string) {
    const url = API_ENDPOINT.getAllRelative.replace('{employeeId}', employeeId);
    console.log("URL ", url);
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response) {
          this.relatives = response.map((relative: any) => {
            // Format date for relative
            let formattedDate = '';
            if (relative.dateOfBirth) {
              const date = new Date(relative.dateOfBirth);
              formattedDate = this.formatDateForInput(date);
            }
            
            return {
              name: `${relative.firstName || ''} ${relative.lastName || ''}`.trim(),
              firstName: relative.firstName || '',
              lastName: relative.lastName || '',
              relationship: relative.relativeType || '',
              relativeType: relative.relativeType || '',
              dateOfBirth: formattedDate,
              phone: relative.phoneNumber || '',
              phoneNumber: relative.phoneNumber || '',
              address: relative.address || '',
              nationality: relative.nationality || 'Việt Nam',
              ethnic: relative.ethnic || '',
              religion: relative.religion || 'Không',
              placeOfBirth: relative.placeOfBirth || '',
              indentityCard: relative.indentityCard || '',
              country: relative.country || 'Việt Nam',
              province: relative.province || '',
              district: relative.district || '',
              commune: relative.commune || '',
              employeeID: relative.employeeID || employeeId
            };
          });
          console.log('Relatives loaded:', this.relatives);
        } else {
          console.log('No relatives data returned or empty data');
          this.relatives = [];
        }
      },
      error: (error) => {
        console.error('Error fetching relatives data:', error);
        this.relatives = [];
      }
    });
  }
  
  addRelative() {
    if (this.newRelative.firstName && this.newRelative.lastName && this.newRelative.relativeType) {
      // Get employeeID from localStorage
      const userProfileString = localStorage.getItem('currentUserProfile');
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        const employeeId = userProfile.employeeID;
        
        const relativeToAdd: Relative = {
          ...this.newRelative,
          employeeID: employeeId,
          name: `${this.newRelative.firstName} ${this.newRelative.lastName}`.trim()
        };
        
        this.relatives.push(relativeToAdd);
        
        // Reset form
        this.newRelative = {
          firstName: '',
          lastName: '',
          relativeType: '',
          dateOfBirth: '',
          phoneNumber: '',
          address: '',
          nationality: 'Việt Nam',
          ethnic: 'Kinh',
          religion: 'Không',
          placeOfBirth: '',
          indentityCard: '',
          country: 'Việt Nam',
          province: '',
          district: '',
          commune: ''
        };
      }
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
