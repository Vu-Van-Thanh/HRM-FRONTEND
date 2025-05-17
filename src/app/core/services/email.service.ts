import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../constants/endpoint';

export enum MailStatus {
  Received = 0,
  Sent = 1,
  Draft = 2,
  Deleted = 3
}

export interface EmailDTO {
  emailId: string;
  subject: string;
  body: string;
  sender: string;
  receivedAt: Date;
  isRead: boolean;
  isStarred: boolean;
  isDeleted: boolean;
  status: MailStatus;
  mailboxId: string;
}

export interface DepartmentDTO {
  departmentId: string;
  departmentName: string;
  description?: string;
  contact?: string;
  location?: string;
  manager?: string;
}

export interface EmployeeDepartmentDTO {
  employeeID: string;
  employeeName: string;
  departmentID: string;
  departmentName: string;
}

export interface EmailTemplateDTO {
  templateId: string;
  templateName: string;
  templateHeader: string;
  templateBody: string;
  searchSQLCMD?: string;
  departmentId?: string;
}

export interface EmployeeFilterDTO {
  department?: string;
  jobTitle?: string;
  managerId?: string;
  employeeId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiEndpoints = API_ENDPOINT;

  constructor(private http: HttpClient) { }

  /**
   * Get all emails for the current employee
   * @returns Observable<EmailDTO[]>
   */
  getAllEmailsByEmployee(): Observable<EmailDTO[]> {
    // Get employee ID from localStorage
    const userProfileString = localStorage.getItem('currentUserProfile');
    if (!userProfileString) {
      throw new Error('User profile not found in localStorage');
    }
    
    const userProfile = JSON.parse(userProfileString);
    const employeeId = userProfile.employeeID;
    
    // Call the API with the employee ID
    return this.http.get<EmailDTO[]>(`${this.apiEndpoints.getAllEmailByEmployee}?employeeID=${employeeId}`);
  }

  /**
   * Get all departments
   * @returns Observable<DepartmentDTO[]>
   */
  getAllDepartments(): Observable<DepartmentDTO[]> {
    return this.http.get<DepartmentDTO[]>(this.apiEndpoints.getAllDepartment);
  }

  /**
   * Get all email templates
   * @returns Observable<EmailTemplateDTO[]>
   */
  getAllEmailTemplates(): Observable<EmailTemplateDTO[]> {
    return this.http.get<EmailTemplateDTO[]>(this.apiEndpoints.getAllTemplateMail);
  }

  /**
   * Get employees by department
   * @param filter EmployeeFilterDTO object containing filter criteria
   * @returns Observable<EmployeeDepartmentDTO[]>
   */
  getEmployeesByFilter(filter: EmployeeFilterDTO): Observable<EmployeeDepartmentDTO[]> {
    // Build query parameters
    let params = '';
    
    if (filter.department) {
      // Đảm bảo tên tham số đúng - dùng 'Department' thay vì 'department'
      params += `Department=${filter.department}`;
    }
    
    if (filter.jobTitle) {
      params += params ? `&JobTitle=${filter.jobTitle}` : `JobTitle=${filter.jobTitle}`;
    }
    
    if (filter.managerId) {
      params += params ? `&ManagerId=${filter.managerId}` : `ManagerId=${filter.managerId}`;
    }
    
    if (filter.employeeId) {
      params += params ? `&EmployeeId=${filter.employeeId}` : `EmployeeId=${filter.employeeId}`;
    }

    const url = params ? `${this.apiEndpoints.getEmployeeID}?${params}` : this.apiEndpoints.getEmployeeID;
    console.log('Calling API with URL:', url);
    return this.http.get<EmployeeDepartmentDTO[]>(url);
  }

  /**
   * Send emails to selected employees using template
   * @param employeeIds List of employee IDs to send emails to
   * @param templateId Template ID to use
   * @returns Observable<any>
   */
  sendEmails(employeeIds: string[], templateId: string): Observable<any> {
    console.log('Sending emails to employees:', employeeIds);
    console.log('Using template ID:', templateId);
    
    // Create params for HTTP request
    const params = {
      Department: '',
      JobTitle: '',
      ManagerId: '',
      EmployeeId: employeeIds.join(','),
      templateId: templateId
    };
    
    console.log('Request params:', params);
    
    // Call the sendMail endpoint with all parameters as query parameters
    const url = `${this.apiEndpoints.sendMail}`;
    
    // Send with params as HTTP parameters
    return this.http.post(url, null, { params });
  }
} 