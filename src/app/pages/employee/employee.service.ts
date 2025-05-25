import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from './employee.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from 'src/app/core/models/kafkaresponse.model';  

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    var body =  { 
      department: '', 
      jobTitle: '', 
      managerId: '',
      employeeId: ''
    };
    return this.http.post<ApiResponse<Employee[]>>(API_ENDPOINT.getAllEmployee, body).pipe(
      tap(data => console.log('Raw data from API:', data)), 
      map(response => response.data),
      map(employees => employees.map((emp,index) => this.mapEmployeeResponse(emp,index))),
      tap(mapped => console.log('Mapped Employee data:', mapped)) // log sau khi map
    );
  }

  getEmployeeById(id: string | number): Observable<Employee> {
    console.log('id:', id);
    var body =  { 
      department: '', 
      jobTitle: '', 
      managerId: '',
      employeeId: id.toString()
    };
    console.log('body:', body);
    return this.http.post<ApiResponse<Employee>>(API_ENDPOINT.getAllEmployee, body).pipe(
      tap(data => console.log('Raw data from API get employee by id:', data)), 
      map(response => {
        const raw = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log('📦 Extracted employee object:', raw);
        return raw;
      }),
      map(employee => this.mapEmployeeResponse(employee,0)),
      tap(mappedEmployee => console.log('✅ Employee after map:', mappedEmployee))
    );
  }

  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(API_ENDPOINT.createEmployee, this.mapEmployeeRequest(employee))
      .pipe(
        map(employee => this.mapEmployeeResponse(employee,0))
      );
  }

  updateEmployee(userId: string, employeeUpdate: any): Observable<any> {
    return this.http.put(`${API_ENDPOINT.updateEmployee}/${userId}`, employeeUpdate);
  }

  deleteEmployee(id: string | number): Observable<boolean> {
    return this.http.delete<boolean>(`${API_ENDPOINT.deleteEmployee}/${id}`);
  }

  searchEmployees(keyword: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${API_ENDPOINT.searchEmployees}?keyword=${keyword}`)
      .pipe(
        map(employees => employees.map(emp => this.mapEmployeeResponse(emp,0)))
      );
  }

  private mapEmployeeResponse(employee: any,index: number): Employee {
    console.log('👉 Input to mapEmployeeResponse:', employee);
    return {
      id: index + 1,
      employeeID: employee.employeeID,
      code: employee.employeeID,
      managerID: employee.managerID,
      position: employee.position,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.firstName && employee.lastName 
        ? `${employee.firstName} ${employee.lastName}`
        : employee.firstName || employee.lastName || '',
      dateOfBirth: employee.dateOfBirth,
      dateIssued: employee.dateIssued,
      gender: employee.gender,
      tax: employee.tax || '',
      address: employee.address,
      nationality: employee.nationality,
      ethnic: employee.ethnic,
      religion: employee.religion,
      placeOfBirth: employee.placeOfBirth,
      indentityCard: employee.indentityCard,
      placeIssued: employee.placeIssued,
      country: employee.country,
      province: employee.province,
      district: employee.district,
      commune: employee.commune,
      insuranceNumber: employee.insuranceNumber,
      avartar: employee.avartar, // Note 'avartar' spelling from backend
      photo: employee.avartar, // Also map to photo for UI compatibility
      identity: employee.identity || [],
      insurance: employee.insurance || [],
      
      // Set default values for fields that might be needed in the UI
      email: employee.email || '',
      phone: employee.phone || '',
      status: true, // Default to active
      
      // Map position to departmentName and positionName if they don't exist
      departmentId: employee.departmentID || 0,
      departmentName: employee.departmentName || employee.position || '',
      positionId: employee.position || 0,
      positionName: employee.positionName || employee.position || '',
      
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      
      // Map existing detailed info fields if they exist
      idCard: employee.idCard || employee.indentityCard,
      idCardIssueDate: employee.idCardIssueDate,
      idCardIssuePlace: employee.idCardIssuePlace || employee.placeIssued,
      taxCode: employee.taxCode || employee.tax,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      relationship: employee.relationship,
      education: employee.education,
      major: employee.major,
      school: employee.school,
      graduationYear: employee.graduationYear,
      joinDate: employee.joinDate,
      contractType: employee.contractType,
      salary: employee.salary,
      bankAccount: employee.bankAccount,
      bankName: employee.bankName,
      bankBranch: employee.bankBranch,
      healthInsuranceNumber: employee.healthInsuranceNumber,
      socialInsuranceNumber: employee.socialInsuranceNumber,
      workHistory: employee.workHistory,
      relatives: employee.relatives,
      contracts: employee.contracts
    };
  }

  private mapEmployeeRequest(employee: Partial<Employee>): any {
    return {
      employeeID: employee.employeeID,
      managerID: employee.managerID,
      position: employee.position,
      firstName: employee.firstName,
      lastName: employee.lastName,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      tax: employee.tax,
      address: employee.address,
      nationality: employee.nationality || 'Việt Nam',
      ethnic: employee.ethnic,
      religion: employee.religion || 'Không',
      placeOfBirth: employee.placeOfBirth,
      indentityCard: employee.indentityCard,
      placeIssued: employee.placeIssued,
      country: employee.country,
      province: employee.province,
      district: employee.district,
      commune: employee.commune,
      insuranceNumber: employee.insuranceNumber,
      avartar: employee.avartar, // Note: backend uses 'avartar' spelling
      identity: employee.identity || [],
      insurance: employee.insurance || []
    };
  }
} 