import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {
  constructor(private http: HttpClient) { }

  /**
   * Get salary information for an employee
   * @param employeeId Employee ID
   * @returns Salary information
   */
  getPayrollInfo(employeeId: string): Observable<any> {
    return this.http.get(`${API_ENDPOINT.getSalaryInfo}?employeeIdList=${employeeId}`);
  }

  /**
   * Get salary history for a base salary ID
   * @param baseId Base salary ID
   * @returns Salary history
   */
  getSalaryHistory(baseId: string): Observable<any> {
    return this.http.get(`${API_ENDPOINT.getSalaryChange}?id=${baseId}`);
  }

  /**
   * Get salary payment history for a base salary ID
   * @param baseId Base salary ID
   * @returns Payment history
   */
  getSalaryPayments(baseId: string): Observable<any> {
    return this.http.get(`${API_ENDPOINT.getSalaryPayment}?id=${baseId}`);
  }
} 