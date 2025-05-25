import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../employee.service';
import { RelativeDialogComponent } from '../relative-dialog/relative-dialog.component';
import { ContractDialogComponent } from '../contract-dialog/contract-dialog.component';
import { Employee } from '../employee.model';
import { fromEventPattern } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

@Component({
  selector: 'app-employee-detail-dialog',
  templateUrl: './employee-detail-dialog.component.html',
  styleUrls: ['./employee-detail-dialog.component.scss']
})
export class EmployeeDetailDialogComponent implements OnInit {
  employee: Employee;
  isEditMode = false;
  educationLevels = ['Trung học', 'Trung cấp', 'Cao đẳng', 'Đại học', 'Thạc sĩ', 'Tiến sĩ'];
  selectedTabIndex = 0;
  positions = []
  workHistoryColumns = ['date', 'type', 'description'];
  workHistory: any[] = [];
  employeeForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Thêm các thuộc tính cho người thân và hợp đồng
  relatives: any[] = [];
  contracts: any[] = [];
  relativesColumns = ['name', 'relationship', 'phone', 'actions'];
  contractsColumns = ['contractNo', 'type', 'startDate', 'endDate', 'actions'];

  departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Customer Service'];
  genders = ['Nam', 'Nữ'];
  statuses = ['Đang làm việc', 'Nghỉ việc', 'Tạm nghỉ'];
  relationships = ['Vợ/Chồng', 'Cha', 'Mẹ', 'Con', 'Anh/Chị', 'Em', 'Khác'];
  contractTypes = ['Hợp đồng không xác định thời hạn', 'Hợp đồng xác định thời hạn', 'Hợp đồng thử việc'];

  loading = false;
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<EmployeeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code: string, isEdit: boolean },
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.isEditMode = data.isEdit;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadPositions();
    if (this.data.code) {
      this.loadEmployee();
    }
  }
  loadPositions() : void {
    this.http.get<any>(`${API_ENDPOINT.getAllJobInternal}`).subscribe(positions => {
      this.positions = positions;
    });
  }
  initForm(): void {
    this.employeeForm = this.fb.group({
      code: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      departmentId: ['', Validators.required],
      positionId: ['', Validators.required],
      status: [true],
      emergencyContact: ['', Validators.required],
      emergencyPhone: ['', Validators.required],
      taxCode: ['', Validators.required],
      joinDate: ['', Validators.required],
      salary: ['', Validators.required],
      contractType: ['', Validators.required],  
      education: ['', Validators.required],
      major: ['', Validators.required],
      school: ['', Validators.required],
      graduationYear: ['', Validators.required],
      idCard : ['', Validators.required],
      idCardIssueDate : ['', Validators.required],
      idCardIssuePlace : ['', Validators.required],
      bankAccount : ['', Validators.required],
      bankName : ['', Validators.required],
      bankBranch : ['', Validators.required],
      photo: ['']
    });
  }

  loadEmployee(): void {
    this.loading = true;
    this.error = null;
    this.employeeService.getEmployeeById(this.data.code).subscribe({
      next: (employee) => {
        console.log('Inputemployee:', employee);
        this.employee = employee;
        console.log('Outputemployee:', this.employee);
        this.employeeForm.patchValue(employee);
        this.loading = false;
        this.loadWorkHistory();
        this.loadRelatives();
        this.loadContracts();
      },
      error: (error) => {
        this.error = 'Có lỗi xảy ra khi tải thông tin nhân viên';
        this.loading = false;
        console.error('Error loading employee:', error);
      }
    });
  }

  loadWorkHistory() {
    // Mock work history data
    this.workHistory = [
      {
        date: '2023-01-15',
        type: 'Thăng chức',
        description: 'Thăng cấp lên Senior Developer'
      },
      {
        date: '2022-06-01',
        type: 'Chuyển phòng ban',
        description: 'Chuyển từ phòng IT sang phòng Development'
      },
      {
        date: '2021-03-15',
        type: 'Tăng lương',
        description: 'Tăng lương theo kết quả đánh giá'
      }
    ];
  }

  loadRelatives() {
    // Mock relatives data
    this.relatives = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        relationship: 'Cha',
        phone: '0123456789'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        relationship: 'Mẹ',
        phone: '0987654321'
      }
    ];
  }

  loadContracts() {
    // Mock contracts data
    this.contracts = [
      {
        id: 1,
        contractNo: 'HD001',
        type: 'Hợp đồng không xác định thời hạn',
        startDate: '2023-01-01',
        endDate: null
      },
      {
        id: 2,
        contractNo: 'HD002',
        type: 'Hợp đồng thử việc',
        startDate: '2022-10-01',
        endDate: '2022-12-31'
      }
    ];
  }

  onAddRelative() {
    const dialogRef = this.dialog.open(RelativeDialogComponent, {
      width: '500px',
      data: { employeeId: this.data.code }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Thêm người thân mới vào danh sách
        const newRelative = {
          id: this.relatives.length + 1,
          ...result
        };
        this.relatives.push(newRelative);
      }
    });
  }

  onEditRelative(relative: any) {
    const dialogRef = this.dialog.open(RelativeDialogComponent, {
      width: '500px',
      data: { employeeId: this.data.code, relative }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Cập nhật thông tin người thân
        const index = this.relatives.findIndex(r => r.id === relative.id);
        if (index !== -1) {
          this.relatives[index] = { ...this.relatives[index], ...result };
        }
      }
    });
  }

  onDeleteRelative(relativeId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người thân này?')) {
      // Xóa người thân khỏi danh sách
      this.relatives = this.relatives.filter(r => r.id !== relativeId);
    }
  }

  onAddContract() {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      width: '500px',
      data: { employeeId: this.data.code }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Thêm hợp đồng mới vào danh sách
        const newContract = {
          id: this.contracts.length + 1,
          ...result
        };
        this.contracts.push(newContract);
      }
    });
  }

  onEditContract(contract: any) {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      width: '500px',
      data: { employeeId: this.data.code, contract }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Cập nhật thông tin hợp đồng
        const index = this.contracts.findIndex(c => c.id === contract.id);
        if (index !== -1) {
          this.contracts[index] = { ...this.contracts[index], ...result };
        }
      }
    });
  }

  onDeleteContract(contractId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      // Xóa hợp đồng khỏi danh sách
      this.contracts = this.contracts.filter(c => c.id !== contractId);
    }
  }

  onEdit() {
    this.isEditMode = true;
    this.selectedTabIndex = 2; // Switch to edit tab
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.employeeForm.patchValue({ photo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    
    if (this.employeeForm.valid) {
      
    }
    const formData = this.employeeForm.value;
  
      let employeeUpdate = {
        EmployeeID : this.data.code,
        Position : '',
        FirstName : formData.firstName,
        LastName : formData.lastName,
        Gender : formData.gender.value ,
        Tax : formData.taxCode,
        Nationality : '',
        Ethnic : '',
        Religion : '',
        PlaceOfBirth : '',
        DateOfBirth : formData.dateOfBirth,
        IndentityCard : '',
        PlaceIssued : '',
        Country : '',
        Province : '',
        District : '',
        Commune : '',
        Address : formData.address,
        InsuranceNumber : '',

      };
      
  
      console.log('Employee update payload:', employeeUpdate);
  
      if (this.isEditMode) {
        this.employeeService.updateEmployee(this.data.code, employeeUpdate).subscribe({
          next: (updatedEmployee) => {
            this.dialogRef.close(updatedEmployee);
          },
          error: (error) => {
            console.error('Error updating employee:', error);
          }
        });
      } /*else {
        this.employeeService.createEmployee(employeeUpdate).subscribe({
          next: (newEmployee) => {
            this.dialogRef.close(newEmployee);
          },
          error: (error) => {
            console.error('Error creating employee:', error);
          }
        });
      }*/

        let userUpdate = {
          Phone : formData.phone,
          Email : formData.email,
        }
  }
  

  onCancel(): void {
    this.dialogRef.close();
  }

  onClose() {
    this.dialogRef.close();
  }
} 