import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalaryDetailComponent } from '../salary-detail/salary-detail.component';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { map, switchMap, tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/kafkaresponse.model';
import { EmployeeDepartmentDTO, SalaryInfo } from '../salary.model';
import { Department } from 'src/app/system/department/department.model';
import { DepartmentService } from '../../department/department.service';

interface Position {
  value: string;
  label: string;
}

interface EmailTemplateSalary{
  templateId : string;
  templateName : string;
  templateBody : string;
  templateHeader : string;
  searchSQLCMD : string;
  departmentId : string;
}
class MailSalary{
  MailboxId: string;
  Subject : string = 'Thông báo lương tháng [Month]/[Year]'
  Body : string;
  Sender : string = 'HRMTV-Human Resource';
}
@Component({
  selector: 'app-salary-list',
  templateUrl: './salary-list.component.html',
  styleUrls: ['./salary-list.component.scss']
})
export class SalaryListComponent implements OnInit {
  filterForm: FormGroup;
  employees: SalaryInfo[] = [];
  batchEmployees : SalaryInfo[] = [];
  departments: Department[] = [];
  employeeList: EmployeeDepartmentDTO[] = [];
  positions: Position[] = [];
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private http: HttpClient,
    private modalService: NgbModal
  ) {
    this.filterForm = this.fb.group({
      department: [''],
      jobTitle: [''],
      managerId: [''],
      employeeId: ['']
    });

    // Khởi tạo danh sách vị trí công việc
    this.positions = [
      { value: 'developer', label: 'Lập trình viên' },
      { value: 'tester', label: 'Kiểm thử viên' },
      { value: 'designer', label: 'Thiết kế' },
      { value: 'manager', label: 'Quản lý' },
      { value: 'accountant', label: 'Kế toán' },
      { value: 'hr', label: 'Nhân sự' },
      { value: 'marketing', label: 'Marketing' }
    ];
  }

  ngOnInit(): void {
    this.loadEmployeeData();
    this.loadDepartments();
  }

  loadEmployeeData(): void {
    const formValues = this.filterForm.value;
    
    const employeeFilter = {
      department: formValues.department || '',
      jobTitle: formValues.jobTitle || '',
      managerId: formValues.managerId || '',
      employeeId: formValues.employeeId || ''
    };
    // Tải danh sách nhân viên dựa trên bộ lọc
    this.http.get<EmployeeDepartmentDTO[]>(API_ENDPOINT.getEmployeeID, { params: employeeFilter })
      .pipe(
        tap(employees => {
          this.employeeList = employees;
        })
      )
      .subscribe(() => {
        this.loadSalaryData();
      }, error => {
        console.error('❌ Lỗi khi tải dữ liệu nhân viên:', error);
      });
  }

  batchSalary() : void {
    if(this.batchEmployees.length === 0) {
      console.warn('ℹ️ Không có nhân viên nào được chọn để gửi thông báo lương.');
      return;
    }   
    let MailSalaryList: MailSalary[] = [];
    const employeeEmails: string[] = [];
    this.http.get<string[]>(API_ENDPOINT.getMailBoxIDList)
      .subscribe(emails => {
        employeeEmails.push(...emails);
      });
    this.http.get<EmailTemplateSalary>(API_ENDPOINT.getSalaryTemplate)
      .subscribe(template => {
        for(let i = 0; i < this.batchEmployees.length; i++) {
          const mail = new MailSalary();
          mail.MailboxId = employeeEmails[i];
          mail.Subject = template.templateName.replace('[Month]', this.today.getMonth().toString()).replace('[Year]', this.today.getFullYear().toString());
          mail.Body = this.processBody(template.templateBody, this.batchEmployees[i]);
          MailSalaryList.push(mail);
        }
      });
    this.http.post(API_ENDPOINT.sendMailList, MailSalaryList)
      .subscribe(response => { 
        if (response) {
          console.log('✅ Gửi thông báo lương thành công:', response);
        } else {
          console.error('❌ Lỗi khi gửi thông báo lương:', response);
        }
      }, error => {
        console.error('❌ Lỗi khi gửi thông báo lương:', error);
      });
  }
  
  processBody (templateBody: string, employee: SalaryInfo): string {
    return '';
  }
  loadSalaryData(): void {
    if (this.employeeList.length === 0) {
      this.employees = [];
      return;
    }
    
    const employeeIds = this.employeeList
    .map(emp => emp.employeeID)
    .filter(id => !!id);
    
    if (employeeIds.length === 0) {
      this.employees = [];
      return;
    }

    const idListParam = employeeIds.join(',');
    this.http.get<SalaryInfo[]>(API_ENDPOINT.getAllSalary + `?employeeIdList=${idListParam}`)
      .pipe(
        tap(salaries => console.log('✅ Dữ liệu lương:', salaries))
      )
      .subscribe(salaries => {
        this.employees = salaries;
      }, error => {
        console.error('❌ Lỗi khi tải dữ liệu lương:', error);
        this.employees = [];
      });
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe(
      departments => {
        console.log('📁 Danh sách phòng ban:', departments);
        this.departments = departments;
      },
      error => {
        console.error('❌ Lỗi khi tải dữ liệu phòng ban:', error);
        this.departments = [];
      }
    );
  }

  getEmployeeName(employeeId?: string): string {
    if (!employeeId) return 'N/A';
    const employee = this.employeeList.find(e => e.employeeID === employeeId);
    return employee?.employeeName || 'N/A';
  }

  getDepartmentName(employeeId?: string): string {
    if (!employeeId) return 'N/A';
    const employee = this.employeeList.find(e => e.employeeID === employeeId);
    const department = this.departments.find(d => d.code === employee?.departmentID);
    return department?.name || 'N/A';
  }

  getPosition(employeeId?: string): string {
    if (!employeeId) return 'N/A';
    const employee = this.employeeList.find(e => e.employeeID === employeeId);
    // Vì EmployeeDepartmentDTO không có trường position,
    // ta dùng map theo jobTitle hoặc trả về giá trị mặc định
    
    // Tìm trong danh sách positions nếu employeeId có chứa jobTitle
    if (employee?.employeeID) {
      const jobTitleMatch = this.positions.find(p => 
        employee.employeeID?.toLowerCase().includes(p.value.toLowerCase())
      );
      if (jobTitleMatch) return jobTitleMatch.label;
    }
    
    // Có thể sử dụng departmentName để phỏng đoán vị trí
    if (employee?.departmentName) {
      if (employee.departmentName.toLowerCase().includes('kế toán')) return 'Kế toán';
      if (employee.departmentName.toLowerCase().includes('it') || 
          employee.departmentName.toLowerCase().includes('kỹ thuật')) return 'Kỹ thuật';
      if (employee.departmentName.toLowerCase().includes('nhân sự')) return 'Nhân sự';
    }
    
    return 'Nhân viên';
  }

  viewSalaryDetails(salary: SalaryInfo): void {
    // Tìm thông tin nhân viên từ danh sách đã lấy được
    const employeeInfo = this.employeeList.find(e => e.employeeID === salary.employeeId);
    const departmentName = this.getDepartmentName(salary.employeeId);
    
    // Tạo đối tượng đầy đủ thông tin để hiển thị trong modal chi tiết
    const completeData = {
      ...salary,
      code: salary.employeeId,
      name: this.getEmployeeName(salary.employeeId),
      department: departmentName,
      position: this.getPosition(salary.employeeId),
      baseSalary: salary.salaryBase?.baseSalary || 0,
      baseId : salary.salaryBase?.salaryId || ''
    };
    
    const modalRef = this.modalService.open(SalaryDetailComponent, {
      size: 'lg',
      centered: true
    });
    
    // Truyền đối tượng đầy đủ vào modal
    modalRef.componentInstance.employee = completeData;
    
    // Xử lý khi modal đóng và trả về kết quả
    modalRef.result.then((result) => {
      console.log('✅ Modal đã được đóng với kết quả:', result);
      // Có thể thực hiện các xử lý cập nhật UI ở đây nếu cần
      this.loadEmployeeData(); // Tải lại dữ liệu sau khi cập nhật
    }, (reason) => {
      console.log('ℹ️ Modal đã bị đóng với lý do:', reason);
    });
  }

  applyFilter(): void {
    this.loadEmployeeData();
  }

  onReset(): void {
    this.filterForm.reset({
      department: '',
      jobTitle: '',
      managerId: '',
      employeeId: ''
    });
    
    this.loadEmployeeData();
  }
} 