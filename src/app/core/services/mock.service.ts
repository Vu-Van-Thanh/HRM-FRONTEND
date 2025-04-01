import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockService {
  private mockData = {
    users: [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      },
      {
        id: 2,
        username: 'user',
        email: 'user@example.com',
        role: 'user'
      }
    ],
    employees: [
      {
        id: 1,
        name: 'John Doe',
        department: 'IT',
        position: 'Developer',
        email: 'john@example.com'
      },
      {
        id: 2,
        name: 'Jane Smith',
        department: 'HR',
        position: 'Manager',
        email: 'jane@example.com'
      }
    ],
    departments: [
      {
        id: 1,
        name: 'IT',
        description: 'Information Technology'
      },
      {
        id: 2,
        name: 'HR',
        description: 'Human Resources'
      }
    ]
  };

  constructor() { }

  // Mock login
  login(credentials: any): Observable<any> {
    const user = this.mockData.users.find(u => 
      u.username === credentials.username && 
      credentials.password === 'password'
    );
    
    if (user) {
      return of({
        accessToken: 'mock-token-' + Date.now(),
        user: user
      }).pipe(delay(500));
    }
    
    return of(null).pipe(delay(500));
  }

  // Mock get users
  getUsers(): Observable<any> {
    return of(this.mockData.users).pipe(delay(500));
  }

  // Mock get employees
  getEmployees(): Observable<any> {
    return of(this.mockData.employees).pipe(delay(500));
  }

  // Mock get departments
  getDepartments(): Observable<any> {
    return of(this.mockData.departments).pipe(delay(500));
  }

  // Mock get user profile
  getUserProfile(): Observable<any> {
    return of(this.mockData.users[0]).pipe(delay(500));
  }
} 