import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../constants/endpoint';

export interface EmployeeInfo {
  employeeID: string;
  departmentID: string;
  managerID: string | null;
  position: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  tax: string;
  address: string;
  nationality: string;
  ethnic: string;
  religion: string;
  placeOfBirth: string;
  indentityCard: string;
  placeIssued: string;
  country: string;
  province: string;
  district: string;
  commune: string;
  insuranceNumber: string;
  avartar: string | null;
  identity: any[];
  insurance: any[];
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiEndpoints = API_ENDPOINT;

  constructor(private http: HttpClient) { }

  /**
   * Get employee by ID
   * @param id Employee ID
   * @returns Observable<EmployeeInfo>
   */
  getEmployeeById(id: string): Observable<EmployeeInfo> {
    return this.http.get<EmployeeInfo>(`${this.apiEndpoints.getEmployeeById}/${id}`);
  }
  
  /**
   * Get current employee from localStorage
   * @returns Current user's employee ID or null
   */
  getCurrentEmployeeId(): string | null {
    const userProfileString = localStorage.getItem('currentUserProfile');
    if (userProfileString) {
      const userProfile = JSON.parse(userProfileString);
      return userProfile.employeeID;
    }
    return null;
  }
} 