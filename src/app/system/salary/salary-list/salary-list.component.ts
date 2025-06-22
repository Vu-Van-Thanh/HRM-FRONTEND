import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalaryDetailComponent } from '../salary-detail/salary-detail.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { map, switchMap, tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/kafkaresponse.model';
import { EmployeeDepartmentDTO, SalaryInfo,AdjustmentResult } from '../salary.model';
import { Department } from 'src/app/system/department/department.model';
import { DepartmentService } from '../../department/department.service';
import {ToastService} from 'angular-toastify'

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
  filterFormBatch : FormGroup;
  employees: SalaryInfo[] = [];
  batchEmployees : SalaryInfo[] = [];
  departments: Department[] = [];
  employeeList: EmployeeDepartmentDTO[] = [];
  positions: Position[] = [];
  today = new Date();
  activeTab: 'salary' | 'accounting' = 'salary';
  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private http: HttpClient,
    private modalService: NgbModal,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      department: [''],
      jobTitle: [''],
      managerId: [''],
      employeeId: ['']
    });

    this.filterFormBatch = this.fb.group({
      accountMonth : [''],
      departmentID : [''],
      employeeIdBatch : [''],
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
  
  
applyFilterBatch() : void {
    const formValues = this.filterFormBatch.value;
    
    const employeeFilter = {
      department: formValues.departmentID || '',
      employeeId: formValues.employeeIdBatch || ''
    };
    console.log('employeeFilter:', employeeFilter);
    this.http.get<EmployeeDepartmentDTO[]>(API_ENDPOINT.getEmployeeID, { params: employeeFilter })
      .pipe(
        tap(employees => {
          this.employeeList = employees;
          console.log('Filtered employees:', this.employeeList);
           const batchEmployee = this.employeeList.map(emp => emp.employeeID);
          let params = new HttpParams();
            batchEmployee.forEach(id => {
              params = params.append('employeeIds', id);
            });

          this.http.get<SalaryInfo[]>(API_ENDPOINT.getBatchSalary, { params }).subscribe(data => {
            console.log("hehe" , data);
            this.batchEmployees = data;
          });
    
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
      this.toastService.error('ℹ️ Không có nhân viên nào được chọn để gửi thông báo lương.');
      return;
    }   
    let MailSalaryList: MailSalary[] = [];
    const employeeEmails: string[] = [];
    this.http.get<string[]>(API_ENDPOINT.getMailBoxIDList.replace('{employeeIds}', this.batchEmployees.map(emp => emp.employeeId).join(',')) )
      .subscribe(emails => {
        employeeEmails.push(...emails);
      });
    console.log('employeeEmails:', employeeEmails);
    this.http.get<EmailTemplateSalary>(API_ENDPOINT.getSalaryTemplate)
      .subscribe(template => {
        console.log('Email template:', template);
        for(let i = 0; i < this.batchEmployees.length; i++) {
          const mail = new MailSalary();
          mail.MailboxId = employeeEmails[i];
          mail.Subject = template.templateName.replace('[Month]', this.today.getMonth().toString()).replace('[Year]', this.today.getFullYear().toString());
          mail.Body = this.processBody(template.templateBody, this.batchEmployees[i]);
          MailSalaryList.push(mail);
        }
        this.http.post(API_ENDPOINT.sendMailList, MailSalaryList)
      .subscribe(response => { 
        if (response) {
          this.toastService.success('✅ Gửi thông báo lương thành công:' + response);
        } else {
          this.toastService.error('❌ Lỗi khi gửi thông báo lương:'+ response);
        }
      }, error => {
        this.toastService.error('❌ Lỗi khi gửi thông báo lương:'+ error);
      });
      });
    
  }
  processBody(templateBody: string, employee: SalaryInfo): string {
  const { salaryBase, adjustments } = employee;
  const finalSalaryNumber = parseFloat(employee.finalSalary) || 0;

  const groupAdjustmentsByType = (type: string) =>
    adjustments.filter(a => a.adjustType === type);

  const renderAdjustmentTable = (list: AdjustmentResult[]) => {
    if (list.length === 0) {
      return `<tr><td colspan="3">Không có khoản nào.</td></tr>`;
    }

    return list.map((adj, index) => `
      <tr>
        <td>${index + 1}.</td>
        <td>${adj.adjustmentName}</td>
        <td style="text-align:right">${this.formatCurrency(Math.abs(adj.resultAmount || 0))}</td>
      </tr>
    `).join("");
  };

  const deductions = groupAdjustmentsByType("Deduction");
  const bonus = groupAdjustmentsByType("Bonus");
  const other = groupAdjustmentsByType("Other");

  const totalDeduction = deductions.reduce((sum, a) => sum + (a.resultAmount || 0), 0);
  const totalBonus = bonus.reduce((sum, a) => sum + (a.resultAmount || 0), 0);
  const totalOther = other.reduce((sum, a) => sum + (a.resultAmount || 0), 0);

  let result = templateBody;

  // Replace adjustment tables
  result = result.replace(/\[DeductionsTable\]/g, renderAdjustmentTable(deductions));
  result = result.replace(/\[BonusItemsTable\]/g, renderAdjustmentTable(bonus));
  result = result.replace(/\[OtherItemsTable\]/g, renderAdjustmentTable(other));

  // Replace total values
  result = result.replace(/\[SalaryBase\]/g, this.formatCurrency(salaryBase.baseSalary));
  result = result.replace(/\[SalaryIndex\]/g, salaryBase.baseIndex.toString());
  result = result.replace(/\[DeductionAmount\]/g, this.formatCurrency(Math.abs(totalDeduction)));
  result = result.replace(/\[BonusAmount\]/g, this.formatCurrency(totalBonus));
  result = result.replace(/\[OtherAmount\]/g, this.formatCurrency(totalOther));
  result = result.replace(/9\.475\.000 VND/g, this.formatCurrency(finalSalaryNumber));

  // Replace static info
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  result = result.replace(/\[Month\]/g, month.toString());
  result = result.replace(/\[Year\]/g, year.toString());
  result = result.replace(/\[CompanyName\]/g, "Công ty ABC");
  result = result.replace(/\[ContractType\]/g, "Hợp đồng chính thức");
  result = result.replace(/\[Manager\]/g, "Nguyễn Văn A");
  result = result.replace(/\[RealAttendance\]/g, "26");
  result = result.replace(/\[TotalAttendace\]/g, "26");
  result = result.replace(/\[ExistLeave\]/g, "0");

  // Optional: Replace OT, Holiday placeholders
  result = result.replace(/\[OTTime\]/g, "0");
  result = result.replace(/\[OTAmount\]/g, "0 VND");
  result = result.replace(/\[HolidayBonus\]/g, "0 VND");

  return result;
}

 formatCurrency(value: number): string {
  return value.toLocaleString("vi-VN") + " VND";
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