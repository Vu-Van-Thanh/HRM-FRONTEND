import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from './employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private mockEmployees: Employee[] = [
    {
      id: 1,
      code: 'EMP001',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      address: 'Số 123, Đường ABC, Quận 1, TP.HCM',
      gender: 'male',
      dateOfBirth: '1990-01-01',
      departmentId: 1,
      departmentName: 'Phòng Kinh Doanh',
      positionId: 1,
      positionName: 'Nhân viên kinh doanh',
      status: true,
      photo: 'assets/images/users/avatar-1.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Thông tin chi tiết
      idCard: '079123456789',
      idCardIssueDate: '2010-01-01',
      idCardIssuePlace: 'Công an Quận 1, TP.HCM',
      taxCode: '0123456789',
      emergencyContact: 'Nguyễn Thị B',
      emergencyPhone: '0987654321',
      relationship: 'Vợ',
      education: 'Đại học',
      major: 'Quản trị kinh doanh',
      school: 'Đại học Kinh tế TP.HCM',
      graduationYear: '2012',
      joinDate: '2015-01-01',
      contractType: 'Hợp đồng không xác định thời hạn',
      salary: 15000000,
      bankAccount: '123456789',
      bankName: 'Vietcombank',
      bankBranch: 'Chi nhánh TP.HCM',
      insuranceNumber: '0123456789',
      healthInsuranceNumber: '9876543210',
      socialInsuranceNumber: '1234567890',
      workHistory: [
        {
          company: 'Công ty ABC',
          position: 'Nhân viên kinh doanh',
          startDate: '2012-01-01',
          endDate: '2014-12-31',
          description: 'Phụ trách kinh doanh khu vực miền Nam'
        },
        {
          company: 'Công ty XYZ',
          position: 'Chuyên viên kinh doanh',
          startDate: '2015-01-01',
          endDate: '2017-12-31',
          description: 'Phụ trách kinh doanh khu vực miền Bắc'
        }
      ],
      relatives: [
        {
          name: 'Nguyễn Thị B',
          relationship: 'Vợ',
          dateOfBirth: '1992-03-15',
          phone: '0987654321',
          address: 'Số 123, Đường ABC, Quận 1, TP.HCM'
        },
        {
          name: 'Nguyễn Văn C',
          relationship: 'Con',
          dateOfBirth: '2015-06-20',
          phone: '',
          address: 'Số 123, Đường ABC, Quận 1, TP.HCM'
        }
      ],
      contracts: [
        {
          contractNo: 'HD001',
          type: 'Hợp đồng thử việc',
          startDate: '2015-01-01',
          endDate: '2015-03-31',
          salary: 12000000,
          status: 'Đã kết thúc'
        },
        {
          contractNo: 'HD002',
          type: 'Hợp đồng không xác định thời hạn',
          startDate: '2015-04-01',
          endDate: null,
          salary: 15000000,
          status: 'Đang có hiệu lực'
        }
      ]
    },
    {
      id: 2,
      code: 'EMP002',
      firstName: 'Trần',
      lastName: 'Thị B',
      fullName: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0123456788',
      address: 'Số 456, Đường XYZ, Quận 2, TP.HCM',
      gender: 'female',
      dateOfBirth: '1992-03-15',
      departmentId: 2,
      departmentName: 'Phòng Kỹ Thuật',
      positionId: 2,
      positionName: 'Lập trình viên',
      status: true,
      photo: 'assets/images/users/avatar-2.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Thông tin chi tiết
      idCard: '079123456788',
      idCardIssueDate: '2012-03-15',
      idCardIssuePlace: 'Công an Quận 2, TP.HCM',
      taxCode: '0123456788',
      emergencyContact: 'Trần Văn C',
      emergencyPhone: '0987654322',
      relationship: 'Cha',
      education: 'Đại học',
      major: 'Công nghệ thông tin',
      school: 'Đại học Bách Khoa TP.HCM',
      graduationYear: '2014',
      joinDate: '2015-06-01',
      contractType: 'Hợp đồng không xác định thời hạn',
      salary: 18000000,
      bankAccount: '987654321',
      bankName: 'Techcombank',
      bankBranch: 'Chi nhánh TP.HCM',
      insuranceNumber: '0123456788',
      healthInsuranceNumber: '9876543211',
      socialInsuranceNumber: '1234567891',
      workHistory: [
        {
          company: 'Công ty DEF',
          position: 'Lập trình viên',
          startDate: '2014-01-01',
          endDate: '2015-05-31',
          description: 'Phát triển ứng dụng web'
        }
      ],
      relatives: [
        {
          name: 'Trần Văn C',
          relationship: 'Cha',
          dateOfBirth: '1960-01-01',
          phone: '0987654322',
          address: 'Số 456, Đường XYZ, Quận 2, TP.HCM'
        },
        {
          name: 'Trần Thị D',
          relationship: 'Mẹ',
          dateOfBirth: '1962-05-15',
          phone: '0987654323',
          address: 'Số 456, Đường XYZ, Quận 2, TP.HCM'
        }
      ],
      contracts: [
        {
          contractNo: 'HD003',
          type: 'Hợp đồng thử việc',
          startDate: '2015-06-01',
          endDate: '2015-08-31',
          salary: 15000000,
          status: 'Đã kết thúc'
        },
        {
          contractNo: 'HD004',
          type: 'Hợp đồng không xác định thời hạn',
          startDate: '2015-09-01',
          endDate: null,
          salary: 18000000,
          status: 'Đang có hiệu lực'
        }
      ]
    },
    {
      id: 3,
      code: 'EMP003',
      firstName: 'Lê',
      lastName: 'Văn C',
      fullName: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0123456787',
      address: 'Số 789, Đường DEF, Quận 3, TP.HCM',
      gender: 'male',
      dateOfBirth: '1988-07-20',
      departmentId: 3,
      departmentName: 'Phòng Nhân Sự',
      positionId: 3,
      positionName: 'Chuyên viên nhân sự',
      status: true,
      photo: 'assets/images/users/avatar-3.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Thông tin chi tiết
      idCard: '079123456787',
      idCardIssueDate: '2008-07-20',
      idCardIssuePlace: 'Công an Quận 3, TP.HCM',
      taxCode: '0123456787',
      emergencyContact: 'Lê Thị D',
      emergencyPhone: '0987654324',
      relationship: 'Vợ',
      education: 'Đại học',
      major: 'Quản trị nhân sự',
      school: 'Đại học Kinh tế TP.HCM',
      graduationYear: '2010',
      joinDate: '2015-03-01',
      contractType: 'Hợp đồng không xác định thời hạn',
      salary: 16000000,
      bankAccount: '456789123',
      bankName: 'ACB',
      bankBranch: 'Chi nhánh TP.HCM',
      insuranceNumber: '0123456787',
      healthInsuranceNumber: '9876543212',
      socialInsuranceNumber: '1234567892',
      workHistory: [
        {
          company: 'Công ty GHI',
          position: 'Chuyên viên nhân sự',
          startDate: '2010-01-01',
          endDate: '2015-02-28',
          description: 'Phụ trách tuyển dụng và đào tạo'
        }
      ],
      relatives: [
        {
          name: 'Lê Thị D',
          relationship: 'Vợ',
          dateOfBirth: '1990-01-01',
          phone: '0987654324',
          address: 'Số 789, Đường DEF, Quận 3, TP.HCM'
        }
      ],
      contracts: [
        {
          contractNo: 'HD005',
          type: 'Hợp đồng không xác định thời hạn',
          startDate: '2015-03-01',
          endDate: null,
          salary: 16000000,
          status: 'Đang có hiệu lực'
        }
      ]
    },
    {
      id: 4,
      code: 'EMP004',
      firstName: 'Phạm',
      lastName: 'Thị D',
      fullName: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0123456786',
      address: 'Số 101, Đường GHI, Quận 4, TP.HCM',
      gender: 'female',
      dateOfBirth: '1995-11-25',
      departmentId: 4,
      departmentName: 'Phòng Tài Chính',
      positionId: 4,
      positionName: 'Kế toán viên',
      status: true,
      photo: 'assets/images/users/avatar-4.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Thông tin chi tiết
      idCard: '079123456786',
      idCardIssueDate: '2015-11-25',
      idCardIssuePlace: 'Công an Quận 4, TP.HCM',
      taxCode: '0123456786',
      emergencyContact: 'Phạm Văn E',
      emergencyPhone: '0987654325',
      relationship: 'Cha',
      education: 'Đại học',
      major: 'Kế toán',
      school: 'Đại học Kinh tế TP.HCM',
      graduationYear: '2017',
      joinDate: '2018-01-01',
      contractType: 'Hợp đồng không xác định thời hạn',
      salary: 14000000,
      bankAccount: '789123456',
      bankName: 'Sacombank',
      bankBranch: 'Chi nhánh TP.HCM',
      insuranceNumber: '0123456786',
      healthInsuranceNumber: '9876543213',
      socialInsuranceNumber: '1234567893',
      workHistory: [
        {
          company: 'Công ty JKL',
          position: 'Kế toán viên',
          startDate: '2017-07-01',
          endDate: '2017-12-31',
          description: 'Phụ trách kế toán tổng hợp'
        }
      ],
      relatives: [
        {
          name: 'Phạm Văn E',
          relationship: 'Cha',
          dateOfBirth: '1965-01-01',
          phone: '0987654325',
          address: 'Số 101, Đường GHI, Quận 4, TP.HCM'
        },
        {
          name: 'Phạm Thị F',
          relationship: 'Mẹ',
          dateOfBirth: '1967-05-15',
          phone: '0987654326',
          address: 'Số 101, Đường GHI, Quận 4, TP.HCM'
        }
      ],
      contracts: [
        {
          contractNo: 'HD006',
          type: 'Hợp đồng thử việc',
          startDate: '2018-01-01',
          endDate: '2018-03-31',
          salary: 13000000,
          status: 'Đã kết thúc'
        },
        {
          contractNo: 'HD007',
          type: 'Hợp đồng không xác định thời hạn',
          startDate: '2018-04-01',
          endDate: null,
          salary: 14000000,
          status: 'Đang có hiệu lực'
        }
      ]
    }
  ];

  constructor() { }

  getEmployees(): Observable<Employee[]> {
    return of(this.mockEmployees);
  }

  getEmployeeById(id: number): Observable<Employee> {
    const employee = this.mockEmployees.find(e => e.id === id);
    return of(employee);
  }

  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: this.mockEmployees.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockEmployees.push(newEmployee);
    return of(newEmployee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    const index = this.mockEmployees.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockEmployees[index] = {
        ...this.mockEmployees[index],
        ...employee,
        updatedAt: new Date()
      };
      return of(this.mockEmployees[index]);
    }
    return of(null);
  }

  deleteEmployee(id: number): Observable<boolean> {
    const index = this.mockEmployees.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockEmployees.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  searchEmployees(keyword: string): Observable<Employee[]> {
    const filteredEmployees = this.mockEmployees.filter(employee => 
      employee.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      employee.email.toLowerCase().includes(keyword.toLowerCase()) ||
      employee.phone.includes(keyword) ||
      employee.code.toLowerCase().includes(keyword.toLowerCase())
    );
    return of(filteredEmployees);
  }
} 