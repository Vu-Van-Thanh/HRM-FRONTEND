import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AttendanceFormComponent } from '../attendance-form/attendance-form.component';
import { MatMenuTrigger } from '@angular/material/menu';

export interface Timesheet {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  total: number;
  customer: string;
  project: string;
  activity: string;
  description: string;
  username: string;
  status: string;
  approved: number;
  cleared: number;
}

export interface Project {
  name: string;
  hours: number;
}

export interface Activity {
  name: string;
  hours: number;
  percentage: number;
  color: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Month {
  value: number;
  label: string;
}

export interface ApprovalTimesheet extends Timesheet {
  employeeName: string;
  department: string;
}

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.scss']
})
export class AttendanceListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('projectsFilterMenu') projectsFilterMenu!: MatMenuTrigger;
  @ViewChild('activitiesFilterMenu') activitiesFilterMenu!: MatMenuTrigger;

  // Tab management
  selectedTabIndex = 0;

  // Personal timesheet
  displayedColumns: string[] = [
    'date', 'checkIn', 'checkOut', 'hours', 'total',
    'customer', 'project', 'activity', 'description',
    'username', 'status', 'approved', 'cleared', 'actions'
  ];
  
  dataSource: MatTableDataSource<Timesheet>;
  dateRange: FormGroup;
  projectFilterControl = new FormControl('');
  activityFilterControl = new FormControl('');

  projects: Project[] = [];
  activities: Activity[] = [];
  filteredProjects: Project[] = [];
  filteredActivities: Activity[] = [];
  totalHours = 0;
  totalProjects = 0;
  totalActivities = 0;

  // Approval timesheet
  approvalDisplayedColumns: string[] = [
    'employee', 'department', 'date', 'hours',
    'project', 'activity', 'description', 'status', 'actions'
  ];
  approvalDataSource: MatTableDataSource<ApprovalTimesheet>;
  
  selectedDepartment: number | null = null;
  selectedStatus: string = 'all';
  selectedMonth: number = new Date().getMonth() + 1;

  departments: Department[] = [
    { id: 1, name: 'Phòng Kỹ thuật' },
    { id: 2, name: 'Phòng Kinh doanh' },
    { id: 3, name: 'Phòng Nhân sự' },
    { id: 4, name: 'Phòng Tài chính' }
  ];

  months: Month[] = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  personalTimesheets: Timesheet[] = [];
  personalDataSource: MatTableDataSource<Timesheet>;
  totalAmount: number = 0;

  employeeFilter: string = '';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.dateRange = this.fb.group({
      start: [null],
      end: [null]
    });

    // Initialize personal timesheet data
    const timesheets: Timesheet[] = [
      {
        id: 1,
        date: '2024-03-14',
        checkIn: '13:00',
        checkOut: '17:30',
        hours: 4.5,
        total: 4.5,
        customer: 'TCB',
        project: 'TCB CBP Kinhdoanh HN',
        activity: 'Lập trình',
        description: 'sửa lỗi cb',
        username: 'thanh.vuvan',
        status: 'Reviewed',
        approved: 1,
        cleared: 4.50
      },
      {
        id: 2,
        date: '2024-03-14',
        checkIn: '08:30',
        checkOut: '12:00',
        hours: 3.5,
        total: 3.5,
        customer: 'TCB',
        project: 'TCB CBP Kinhdoanh HN',
        activity: 'Lập trình',
        description: 'sửa lỗi cb',
        username: 'thanh.vuvan',
        status: 'Reviewed',
        approved: 1,
        cleared: 3.50
      },
      {
        id: 3,
        date: '2024-03-13',
        checkIn: '13:00',
        checkOut: '17:30',
        hours: 4.5,
        total: 4.5,
        customer: 'TCB',
        project: 'TCB CBP Kinhdoanh HN',
        activity: 'Lập trình',
        description: 'sửa lỗi cb',
        username: 'thanh.vuvan',
        status: 'Reviewed',
        approved: 1,
        cleared: 4.50
      },
      {
        id: 4,
        date: '2024-03-12',
        checkIn: '09:00',
        checkOut: '12:00',
        hours: 3.0,
        total: 3.0,
        customer: 'Viettel',
        project: 'Viettel CRM',
        activity: 'Phân tích',
        description: 'Phân tích yêu cầu khách hàng',
        username: 'nguyen.van.a',
        status: 'Pending',
        approved: 0,
        cleared: 0.0
      },
      {
        id: 5,
        date: '2024-03-12',
        checkIn: '13:30',
        checkOut: '17:30',
        hours: 4.0,
        total: 4.0,
        customer: 'FPT',
        project: 'FPT ERP',
        activity: 'Lập trình',
        description: 'Phát triển module mới',
        username: 'tran.thi.b',
        status: 'Reviewed',
        approved: 1,
        cleared: 4.0
      },
      {
        id: 6,
        date: '2024-03-11',
        checkIn: '08:00',
        checkOut: '11:30',
        hours: 3.5,
        total: 3.5,
        customer: 'VNPT',
        project: 'VNPT Billing System',
        activity: 'Test',
        description: 'Kiểm thử hệ thống',
        username: 'le.van.c',
        status: 'Approved',
        approved: 1,
        cleared: 3.5
      },
      {
        id: 7,
        date: '2024-03-10',
        checkIn: '10:00',
        checkOut: '15:00',
        hours: 5.0,
        total: 5.0,
        customer: 'Techcombank',
        project: 'TCB Mobile App',
        activity: 'Support',
        description: 'Hỗ trợ khách hàng',
        username: 'pham.thi.d',
        status: 'Pending',
        approved: 0,
        cleared: 0.0
      },
      {
        id: 8,
        date: '2024-03-09',
        checkIn: '09:00',
        checkOut: '12:30',
        hours: 3.5,
        total: 3.5,
        customer: 'Vingroup',
        project: 'VinID Loyalty',
        activity: 'Quản trị',
        description: 'Quản lý dự án',
        username: 'hoang.van.e',
        status: 'Reviewed',
        approved: 1,
        cleared: 3.5
      }
    ];

    this.dataSource = new MatTableDataSource(timesheets);

    // Initialize approval timesheet data
    const approvalTimesheets: ApprovalTimesheet[] = [
      {
        id: 1,
        employeeName: 'Nguyễn Văn A',
        department: 'Phòng Kỹ thuật',
        date: '2024-03-14',
        checkIn: '08:00',
        checkOut: '17:30',
        hours: 8.5,
        total: 8.5,
        customer: 'VCB',
        project: 'VCB Mobile Banking',
        activity: 'Phát triển',
        description: 'Phát triển tính năng mới',
        username: 'nguyen.van.a',
        status: 'pending',
        approved: 0,
        cleared: 0
      },
      {
        id: 2,
        employeeName: 'Trần Thị B',
        department: 'Phòng Kỹ thuật',
        date: '2024-03-14',
        checkIn: '08:30',
        checkOut: '17:30',
        hours: 8.0,
        total: 8.0,
        customer: 'TCB',
        project: 'TCB Internet Banking',
        activity: 'Testing',
        description: 'Kiểm thử module thanh toán',
        username: 'tran.thi.b',
        status: 'approved',
        approved: 1,
        cleared: 8.0
      },
      {
        id: 3,
        employeeName: 'Lê Văn C',
        department: 'Phòng Kinh doanh',
        date: '2024-03-14',
        checkIn: '09:00',
        checkOut: '18:00',
        hours: 8.0,
        total: 8.0,
        customer: 'MB',
        project: 'MB App',
        activity: 'Phân tích',
        description: 'Phân tích yêu cầu khách hàng',
        username: 'le.van.c',
        status: 'rejected',
        approved: 0,
        cleared: 0
      }
    ];

    this.approvalDataSource = new MatTableDataSource(approvalTimesheets);

    // Initialize projects data
    this.projects = [
      { name: 'TCB CBP Kinhdoanh HN', hours: 220.5 },
      { name: 'AAS FLE Bảo trì 24', hours: 45.0 },
      { name: 'APG FLE Sảnphẩm 24', hours: 32.5 },
      { name: 'CK Support Internal', hours: 24.0 }
    ];
    this.filteredProjects = [...this.projects];

    // Initialize activities data
    this.activities = [
      { name: 'Lập trình', hours: 180.5, percentage: 60, color: 'primary' },
      { name: 'Phân tích', hours: 45.0, percentage: 15, color: 'accent' },
      { name: 'Quản trị', hours: 32.5, percentage: 10, color: 'warn' },
      { name: 'Support', hours: 24.0, percentage: 8, color: 'primary' },
      { name: 'Test', hours: 40.0, percentage: 7, color: 'accent' }
    ];
    this.filteredActivities = [...this.activities];

    // Calculate totals
    this.totalHours = this.activities.reduce((sum, activity) => sum + activity.hours, 0);
    this.totalProjects = this.projects.length;
    this.totalActivities = this.activities.length;
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.approvalDataSource.sort = this.sort;
    this.approvalDataSource.paginator = this.paginator;
  }

  loadData(): void {
    if (this.selectedTabIndex === 0) {
      this.loadPersonalTimesheets();
    } else {
      this.loadApprovalTimesheets();
    }
  }

  loadPersonalTimesheets(): void {
    this.personalTimesheets = [
      {
        id: 1,
        date: '2024-03-18',
        checkIn: '09:00',
        checkOut: '17:00',
        hours: 8,
        total: 800000,
        customer: 'ABC Corp',
        project: 'Website Development',
        activity: 'Frontend Development',
        description: 'Implemented new UI components',
        username: 'john.doe',
        status: 'Approved',
        approved: 1,
        cleared: 1
      },
      {
        id: 2,
        date: '2024-03-19',
        checkIn: '08:30',
        checkOut: '17:30',
        hours: 9,
        total: 900000,
        customer: 'XYZ Ltd',
        project: 'Mobile App',
        activity: 'Backend Integration',
        description: 'API integration and testing',
        username: 'john.doe',
        status: 'Pending',
        approved: 0,
        cleared: 0
      },
      {
        id: 3,
        date: '2024-03-20',
        checkIn: '09:15',
        checkOut: '18:15',
        hours: 9,
        total: 900000,
        customer: 'DEF Inc',
        project: 'System Maintenance',
        activity: 'Bug Fixes',
        description: 'Fixed reported issues in production',
        username: 'john.doe',
        status: 'Pending',
        approved: 0,
        cleared: 0
      }
    ];
    
    this.personalDataSource = new MatTableDataSource(this.personalTimesheets);
    this.calculateTotals();
  }

  loadApprovalTimesheets(): void {
    // TODO: Call API to load approval timesheets
    // For now, we're using mock data initialized in constructor
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.loadData();
  }

  // Personal timesheet methods
  applyProjectFilter(event?: Event): void {
    const filterValue = this.projectFilterControl.value?.toLowerCase() || '';
    this.filteredProjects = this.projects.filter(project => 
      project.name.toLowerCase().includes(filterValue)
    );
  }

  applyActivityFilter(event?: Event): void {
    const filterValue = this.activityFilterControl.value?.toLowerCase() || '';
    this.filteredActivities = this.activities.filter(activity => 
      activity.name.toLowerCase().includes(filterValue)
    );
  }

  openTimesheetForm(row?: Timesheet): void {
    const dialogRef = this.dialog.open(AttendanceFormComponent, {
      width: '800px',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toastService.success('Timesheet saved successfully!');
        // Refresh data
        // TODO: Implement API call to refresh data
      }
    });
  }

  deleteTimesheet(row: Timesheet): void {
    if (confirm('Are you sure you want to delete this timesheet record?')) {
      // TODO: Implement API call to delete timesheet
      this.toastService.success('Timesheet deleted successfully!');
      // Refresh data
      // TODO: Implement API call to refresh data
    }
  }

  // Approval timesheet methods
  onDepartmentChange(): void {
    this.filterApprovalTimesheets();
  }

  onStatusChange(): void {
    this.filterApprovalTimesheets();
  }

  onMonthChange(): void {
    this.filterApprovalTimesheets();
  }

  onEmployeeFilterChange() {
    this.filterApprovalTimesheets();
  }

  filterApprovalTimesheets() {
    let filteredData = [...this.approvalDataSource.data];
    
    // Filter by department
    if (this.selectedDepartment) {
      filteredData = filteredData.filter(item => item.department === this.departments.find(d => d.id === this.selectedDepartment)?.name);
    }
    
    // Filter by month
    if (this.selectedMonth) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === this.selectedMonth - 1;
      });
    }
    
    // Filter by status
    if (this.selectedStatus) {
      filteredData = filteredData.filter(item => item.status === this.selectedStatus);
    }
    
    // Filter by employee code
    if (this.employeeFilter) {
      const searchTerm = this.employeeFilter.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.employeeName && item.employeeName.toLowerCase().includes(searchTerm)
      );
    }
    
    this.approvalDataSource.data = filteredData;
  }

  approveTimesheet(row: ApprovalTimesheet): void {
    // TODO: Call API to approve timesheet
    row.status = 'approved';
    row.approved = 1;
    this.toastService.success('Đã duyệt khai công thành công');
  }

  rejectTimesheet(row: ApprovalTimesheet): void {
    // TODO: Call API to reject timesheet
    row.status = 'rejected';
    row.approved = 0;
    this.toastService.success('Đã từ chối khai công');
  }

  viewTimesheetDetail(row: ApprovalTimesheet): void {
    const dialogRef = this.dialog.open(AttendanceFormComponent, {
      width: '800px',
      data: row,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toastService.success('Đã cập nhật khai công thành công');
        this.loadApprovalTimesheets();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  }

  calculateStatistics(timesheets: Timesheet[]): void {
    // Implementation of calculateStatistics method
  }

  calculateTotals() {
    this.totalAmount = this.personalTimesheets.reduce((sum, timesheet) => sum + timesheet.total, 0);
  }
}