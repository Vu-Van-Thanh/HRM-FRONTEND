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
} 