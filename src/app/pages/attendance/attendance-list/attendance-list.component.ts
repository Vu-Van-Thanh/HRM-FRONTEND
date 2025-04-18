import { Component, OnInit, ViewChild } from '@angular/core';
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
  date: Date;
  checkIn: string;
  checkOut: string;
  hours: string;
  total: number;
  customer: string;
  project: string;
  activity: string;
  description: string;
  username: string;
  status: string;
  approved: boolean;
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

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.scss']
})
export class AttendanceListComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('projectsFilterMenu') projectsFilterMenu!: MatMenuTrigger;
  @ViewChild('activitiesFilterMenu') activitiesFilterMenu!: MatMenuTrigger;

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

    // Initialize with sample data
    const timesheets: Timesheet[] = [
      {
        id: 1,
        date: new Date('2024-03-14'),
        checkIn: '13:00',
        checkOut: '17:30',
        hours: '4:30',
        total: 4.5,
        customer: 'TCB',
        project: 'TCB CBP Kinhdoanh HN',
        activity: 'Lập trình',
        description: 'sửa lỗi cb',
        username: 'thanh.vuvan',
        status: 'Reviewed',
        approved: true,
        cleared: 4.50
      },
      {
        id: 2,
        date: new Date('2024-03-14'),
        checkIn: '08:30',
        checkOut: '12:00',
        hours: '3:30',
        total: 3.5,
        customer: 'TCB',
        project: 'TCB CBP Kinhdoanh HN',
        activity: 'Lập trình',
        description: 'sửa lỗi cb',
        username: 'thanh.vuvan',
        status: 'Reviewed',
        approved: true,
        cleared: 3.50
      },
      {
        id: 3,
        date: new Date('2024-03-13'),
        checkIn: '13:00',
        checkOut: '17:30',
        hours: '4:30',
        total: 4.5,
        customer: 'TCB',
        project: 'TCB CBP Kinhdoanh HN',
        activity: 'Lập trình',
        description: 'sửa lỗi cb',
        username: 'thanh.vuvan',
        status: 'Reviewed',
        approved: true,
        cleared: 4.50
      },
      {
        id: 4,
        date: new Date('2024-03-12'),
        checkIn: '09:00',
        checkOut: '12:00',
        hours: '3:00',
        total: 3.0,
        customer: 'Viettel',
        project: 'Viettel CRM',
        activity: 'Phân tích',
        description: 'Phân tích yêu cầu khách hàng',
        username: 'nguyen.van.a',
        status: 'Pending',
        approved: false,
        cleared: 0.0
      },
      {
        id: 5,
        date: new Date('2024-03-12'),
        checkIn: '13:30',
        checkOut: '17:30',
        hours: '4:00',
        total: 4.0,
        customer: 'FPT',
        project: 'FPT ERP',
        activity: 'Lập trình',
        description: 'Phát triển module mới',
        username: 'tran.thi.b',
        status: 'Reviewed',
        approved: true,
        cleared: 4.0
      },
      {
        id: 6,
        date: new Date('2024-03-11'),
        checkIn: '08:00',
        checkOut: '11:30',
        hours: '3:30',
        total: 3.5,
        customer: 'VNPT',
        project: 'VNPT Billing System',
        activity: 'Test',
        description: 'Kiểm thử hệ thống',
        username: 'le.van.c',
        status: 'Approved',
        approved: true,
        cleared: 3.5
      },
      {
        id: 7,
        date: new Date('2024-03-10'),
        checkIn: '10:00',
        checkOut: '15:00',
        hours: '5:00',
        total: 5.0,
        customer: 'Techcombank',
        project: 'TCB Mobile App',
        activity: 'Support',
        description: 'Hỗ trợ khách hàng',
        username: 'pham.thi.d',
        status: 'Pending',
        approved: false,
        cleared: 0.0
      },
      {
        id: 8,
        date: new Date('2024-03-09'),
        checkIn: '09:00',
        checkOut: '12:30',
        hours: '3:30',
        total: 3.5,
        customer: 'Vingroup',
        project: 'VinID Loyalty',
        activity: 'Quản trị',
        description: 'Quản lý dự án',
        username: 'hoang.van.e',
        status: 'Reviewed',
        approved: true,
        cleared: 3.5
      }
    ];
    this.dataSource = new MatTableDataSource(timesheets);

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
    // Additional initialization if needed
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

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
}