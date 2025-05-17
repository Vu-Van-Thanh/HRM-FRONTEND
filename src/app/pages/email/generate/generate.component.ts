import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/core/services/system.service';
import { EmailService, DepartmentDTO, EmailTemplateDTO, EmployeeDepartmentDTO, EmployeeFilterDTO } from 'src/app/core/services/email.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  
  // Editor
  public Editor = ClassicEditor;
  
  // Filter properties
  departments: DepartmentDTO[] = [];
  emailTemplates: EmailTemplateDTO[] = [];
  departmentEmployees: EmployeeDepartmentDTO[] = [];
  
  // Selected values
  selectedDepartmentId: string = '';
  selectedTemplateId: string = '';
  selectedRecipients: EmployeeDepartmentDTO[] = [];
  
  // Email compose form
  composeForm: FormGroup;
  templateContent: string = '<p>Nội dung email</p>';
  safeTemplateContent: SafeHtml | null = null;
  
  // Loading states
  isLoadingDepartments: boolean = false;
  isLoadingTemplates: boolean = false;
  isLoadingEmployees: boolean = false;
  isSending: boolean = false;
  
  constructor(
    private systemService: SystemService,
    private emailService: EmailService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.composeForm = this.formBuilder.group({
      to: [''],
      subject: [''],
      content: ['<p>Nội dung email</p>']
    });
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Email' }, { label: 'Tạo email', active: true }];
    this.loadDepartments();
    this.loadEmailTemplates();
  }

  /**
   * Load departments list from API
   */
  loadDepartments() {
    this.isLoadingDepartments = true;
    this.emailService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        console.log('Departments loaded:', departments);
        
        // Kiểm tra dữ liệu department
        if (departments && departments.length > 0) {
          console.log('Ví dụ department đầu tiên:', departments[0]);
          console.log('departmentId field:', departments[0].departmentId);
          console.log('departmentName field:', departments[0].departmentName);
        }
        
        this.isLoadingDepartments = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.isLoadingDepartments = false;
      }
    });
  }

  /**
   * Load email templates from API
   */
  loadEmailTemplates() {
    this.isLoadingTemplates = true;
    this.emailService.getAllEmailTemplates().subscribe({
      next: (templates) => {
        this.emailTemplates = templates;
        console.log('Email templates loaded:', templates);
        this.isLoadingTemplates = false;
      },
      error: (error) => {
        console.error('Error loading email templates:', error);
        this.isLoadingTemplates = false;
      }
    });
  }

  /**
   * Load employees by department
   */
  loadEmployeesByDepartment(departmentId: string) {
    // Xóa dữ liệu nhân viên nếu không có departmentId
    if (!departmentId || departmentId === "") {
      console.log("Không có department ID, xóa danh sách nhân viên");
      this.departmentEmployees = [];
      this.selectedRecipients = [];
      this.updateRecipientsField();
      return;
    }
    
    console.log("Đang tải nhân viên cho department ID:", departmentId);
    this.isLoadingEmployees = true;
    
    // Hiển thị thông tin department đã chọn
    const selectedDepartment = this.departments.find(d => d.departmentId === departmentId);
    console.log("Thông tin department đã chọn:", selectedDepartment);
    
    // Tạo đối tượng filter với Department
    const filter: EmployeeFilterDTO = {
      department: departmentId
    };
    
    console.log("Filter object gửi đến API:", JSON.stringify(filter));
    
    // Gọi API để lấy nhân viên theo department
    this.emailService.getEmployeesByFilter(filter).subscribe({
      next: (employees) => {
        console.log("Kết quả API - Nhân viên phòng ban:", employees);
        this.departmentEmployees = employees;
        this.isLoadingEmployees = false;
        
        // Reset danh sách người nhận đã chọn
        this.selectedRecipients = [];
        this.updateRecipientsField();
      },
      error: (error) => {
        console.error("Lỗi API - Không thể tải danh sách nhân viên:", error);
        this.isLoadingEmployees = false;
        this.departmentEmployees = [];
      }
    });
  }

  /**
   * Handle department change
   */
  onDepartmentChange(event: any) {
    // Lấy giá trị trực tiếp từ select element và kiểm tra kỹ
    const select = event.target;
    const departmentId = select.value;
    
    console.log("Select element:", select);
    console.log("Selected index:", select.selectedIndex);
    console.log("Selected option:", select.options[select.selectedIndex]);
    console.log("Raw departmentId from event:", departmentId);
    
    // Kiểm tra giá trị departmentId
    if (!departmentId || departmentId === "undefined" || departmentId === "") {
      console.warn("Không có departmentId hợp lệ được chọn!");
      this.selectedDepartmentId = "";
      this.departmentEmployees = [];
      this.selectedRecipients = [];
      this.updateRecipientsField();
      return;
    }
    
    // Nếu có departmentId hợp lệ, cập nhật và gọi API
    this.selectedDepartmentId = departmentId;
    console.log("Đã xác nhận departmentId:", this.selectedDepartmentId);
    
    // Thử tìm thông tin department từ danh sách đã load
    const selectedDepartment = this.departments.find(d => d.departmentId === departmentId);
    console.log("Thông tin department đã chọn:", selectedDepartment);
    
    this.loadEmployeesByDepartment(departmentId);
    
    // Reset danh sách người nhận đã chọn
    this.selectedRecipients = [];
    this.updateRecipientsField();
  }

  /**
   * Handle template change
   */
  onTemplateChange(event: any) {
    const templateId = event.target.value;
    this.selectedTemplateId = templateId;
    
    if (templateId) {
      const selectedTemplate = this.emailTemplates.find(t => t.templateId === templateId);
      if (selectedTemplate) {
        this.composeForm.patchValue({
          subject: selectedTemplate.templateHeader,
          content: selectedTemplate.templateBody
        });
        
        this.templateContent = selectedTemplate.templateBody;
        this.safeTemplateContent = this.sanitizer.bypassSecurityTrustHtml(selectedTemplate.templateBody);
      }
    }
  }

  /**
   * Check if an employee is selected
   */
  isSelected(employee: EmployeeDepartmentDTO): boolean {
    return this.selectedRecipients.some(e => e.employeeID === employee.employeeID);
  }

  /**
   * Toggle employee selection
   */
  onEmployeeSelect(employee: EmployeeDepartmentDTO) {
    const index = this.selectedRecipients.findIndex(e => e.employeeID === employee.employeeID);
    if (index === -1) {
      this.selectedRecipients.push(employee);
    } else {
      this.selectedRecipients.splice(index, 1);
    }
    
    this.updateRecipientsField();
  }

  /**
   * Remove an employee from selection
   */
  removeEmployee(employee: EmployeeDepartmentDTO) {
    const index = this.selectedRecipients.findIndex(e => e.employeeID === employee.employeeID);
    if (index !== -1) {
      this.selectedRecipients.splice(index, 1);
    }
    
    this.updateRecipientsField();
  }

  /**
   * Update the To field with selected recipients
   */
  updateRecipientsField() {
    const recipientNames = this.selectedRecipients.map(r => r.employeeName).join(', ');
    this.composeForm.patchValue({ to: recipientNames });
  }

  /**
   * Send email to selected recipients
   */
  sendEmail() {
    if (this.selectedRecipients.length === 0) {
      alert('Vui lòng chọn ít nhất một người nhận');
      return;
    }
    
    if (!this.selectedTemplateId) {
      alert('Vui lòng chọn một mẫu email');
      return;
    }
    
    // Hiển thị thông báo đang xử lý
    this.isSending = true;
    
    // Lấy danh sách employeeID từ selectedRecipients
    const employeeIds = this.selectedRecipients.map(r => r.employeeID);
    
    console.log('Chuẩn bị gửi email đến:', employeeIds);
    console.log('Sử dụng template ID:', this.selectedTemplateId);
    
    // Gọi API để gửi email
    this.emailService.sendEmails(employeeIds, this.selectedTemplateId).subscribe({
      next: (response) => {
        console.log('Kết quả gửi email:', response);
        this.isSending = false;
        
        // Hiển thị thông báo thành công
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã gửi email thành công',
          icon: 'success',
          confirmButtonText: 'Đóng'
        });
        
        // Reset form
        this.resetForm();
      },
      error: (error) => {
        console.error('Lỗi khi gửi email:', error);
        this.isSending = false;
        
        // Hiển thị thông báo lỗi
        Swal.fire({
          title: 'Lỗi!',
          text: 'Không thể gửi email. Vui lòng thử lại sau.',
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
      }
    });
  }
  
  /**
   * Reset form và các trạng thái
   */
  resetForm() {
    this.selectedTemplateId = '';
    this.selectedDepartmentId = '';
    this.selectedRecipients = [];
    this.departmentEmployees = [];
    this.composeForm.patchValue({
      to: '',
      subject: '',
      content: '<p>Nội dung email</p>'
    });
    this.templateContent = '<p>Nội dung email</p>';
  }
} 