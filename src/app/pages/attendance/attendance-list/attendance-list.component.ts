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
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// New model to match backend API response
export interface AttendanceResponse {
  attendanceId: string;
  employeeId: string;
  attendanceDate: string;
  starttime: string;
  endtime: string;
  status: string;
  position: string;
  description: string;
  activityId: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Updated Project interface to match backend
export interface Project {
  projectId: string;
  name: string;
  hours: number;
}

// Original interfaces for backward compatibility
export interface Timesheet {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  total: number;
  customer: string;
  project: string;
  projectName?: string;
  activity: string;
  description: string;
  username: string;
  status: string;
  approved: number;
  cleared: number;
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

// Add this interface near the top with other interfaces
export interface ProjectFilterDTO {
  DeparmentID?: string;
  StartTime?: string;
  EndTime?: string;
  Status?: string;
}

export interface ProjectResponse {
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  departmentId?: string;
}

// Add this interface near the top with other interfaces
export interface AttendanceFilterDTO {
  StartDate?: string;
  EndDate?: string;
  Starttime?: string;
  Endtime?: string;
  ProjectId?: string;
  Position?: string;
  EmployeeIDList?: string;
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

  // Add the new raw data array
  attendanceData: AttendanceResponse[] = [];

  selectedProject: Project | null = null;

  // Add these properties to the class
  selectedPosition: string | null = null;
  startTime: string | null = null;
  endTime: string | null = null;
  positions: string[] = ['Developer', 'Tester', 'Business Analyst', 'Project Manager', 'Designer', 'DevOps'];

  // Add this property to handle debounce
  private filterTimeout: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private toastService: ToastService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.dateRange = this.fb.group({
      start: [null],
      end: [null],
      startTime: [null],
      endTime: [null],
      projectId: [null],
      position: [null]
    });

    // Subscribe to date range changes
    this.dateRange.valueChanges.subscribe(() => {
      this.onDateRangeChange();
    });

    // Initialize mock data with correct Project structure
    this.projects = [
      { projectId: '1', name: 'TCB CBP Kinhdoanh HN', hours: 8.0 },
      { projectId: '2', name: 'Viettel CRM', hours: 3.0 },
      { projectId: '3', name: 'FPT ERP', hours: 4.0 },
      { projectId: '4', name: 'VNPT Billing System', hours: 3.5 }
    ];

    this.filteredProjects = [...this.projects];

    // Initialize remaining mock data
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
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  loadData(): void {
    this.loadPersonalTimesheets();
    this.loadProjects();
    this.loadApprovalTimesheets();
  }

  loadPersonalTimesheets(): void {
    const filterParams: AttendanceFilterDTO = {};
        const currentUserProfileRaw = localStorage.getItem('currentUserProfile');
    let employeeID = '';
    if (currentUserProfileRaw) {
      try {
        const currentUserProfile = JSON.parse(currentUserProfileRaw);
        if (currentUserProfile.employeeID) {
          employeeID = currentUserProfile.employeeID;
        }
      } catch (error) {
        console.error('Error parsing currentUserProfile from localStorage:', error);
      }
    }
        if (employeeID) {
      filterParams.EmployeeIDList = employeeID;
    }
        const formValues = this.dateRange.value;
    if (formValues.start) {
      filterParams.StartDate = new Date(formValues.start).toISOString();
    }
    
    if (formValues.end) {
      filterParams.EndDate = new Date(formValues.end).toISOString();
    }
    if (formValues.startTime) {
      filterParams.Starttime = formValues.startTime;
    }
    
    if (formValues.endTime) {
      filterParams.Endtime = formValues.endTime;
    }
    if (this.selectedProject) {
      filterParams.ProjectId = this.selectedProject.projectId;
    } else if (formValues.projectId) {
      filterParams.ProjectId = formValues.projectId;
    }
    if (formValues.position) {
      filterParams.Position = formValues.position;
    } else if (this.selectedPosition) {
      filterParams.Position = this.selectedPosition;
    }
    this.http.get<AttendanceResponse[]>(API_ENDPOINT.getAllAttendace, { params: filterParams as any })
      .pipe(
        map(responses => this.mapAttendanceResponseToTimesheet(responses)),
        catchError(error => {
          console.error('Error fetching attendance data:', error);
          return of([]);
        })
      )
      .subscribe(timesheets => {
        this.personalTimesheets = timesheets;
        this.dataSource = new MatTableDataSource(this.personalTimesheets);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        
        this.calculateStatistics(this.personalTimesheets);
        this.calculateTotals();
        this.calculateProjectHours(this.personalTimesheets);
      });
  }

  // Get user-friendly status display
  getStatusDisplay(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status || 'N/A';
    }
  }

  // New function to map API response to the Timesheet format
  private mapAttendanceResponseToTimesheet(responses: AttendanceResponse[]): Timesheet[] {
    return responses.map((attendance, index) => {
      // Calculate hours between start and end time
      const startTime = new Date(attendance.starttime);
      const endTime = new Date(attendance.endtime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Find project name if project ID matches
      const project = this.projects.find(p => p.projectId === attendance.projectId);
      const projectName = project ? project.name : attendance.projectId;
      
      // Use position as activity name for better readability
      const activityName = attendance.position || attendance.activityId || 'N/A';
      
      // Get user-friendly status
      const statusDisplay = this.getStatusDisplay(attendance.status);
      
      return {
        id: index + 1, // Generate a temporary ID
        date: attendance.attendanceDate.split('T')[0], // Format as YYYY-MM-DD
        checkIn: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        checkOut: endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        hours: parseFloat(hours.toFixed(2)),
        total: parseFloat(hours.toFixed(2)),
        customer: 'N/A', // Not provided in the response
        project: attendance.projectId, // Store ID for filtering
        projectName: projectName, // Store name for display
        activity: activityName, // Use position as activity name
        description: attendance.description,
        username: attendance.employeeId, // Will need to fetch employee name from employee service
        status: statusDisplay,
        approved: attendance.status?.toLowerCase() === 'approved' ? 1 : 0,
        cleared: attendance.status?.toLowerCase() === 'approved' ? parseFloat(hours.toFixed(2)) : 0
      };
    });
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
    if (!status) return '';
    
    if (status.includes('Chờ duyệt') || status.toLowerCase().includes('pending')) {
      return 'status-pending';
    } else if (status.includes('Đã duyệt') || status.toLowerCase().includes('approved')) {
      return 'status-approved';
    } else if (status.includes('Từ chối') || status.toLowerCase().includes('rejected')) {
      return 'status-rejected';
    }
    return '';
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

  loadProjects(): void {
    // Create filter object based on form values
    const filterParams: ProjectFilterDTO = {};
    
    if (this.dateRange.value.start) {
      filterParams.StartTime = this.dateRange.value.start.toISOString();
    }
    
    if (this.dateRange.value.end) {
      filterParams.EndTime = this.dateRange.value.end.toISOString();
    }
    
    if (this.selectedDepartment) {
      filterParams.DeparmentID = this.selectedDepartment.toString();
    }
    
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      filterParams.Status = this.selectedStatus;
    }
    
    // Fetch projects from the API with filters
    this.http.get<ProjectResponse[]>(API_ENDPOINT.getAllProject, { params: filterParams as any })
      .pipe(
        map(response => {
          console.log('Project API response:', response);
          // Map API response to the Project model
          return response.map(project => ({
            projectId: project.projectId,
            name: project.name || 'Unnamed Project',
            hours: 0 // Default value, will be updated in calculateProjectHours
          }));
        }),
        catchError(error => {
          console.error('Error fetching projects:', error);
          this.toastService.error('Failed to load projects: ' + error.message);
          return of([]);
        })
      )
      .subscribe(projects => {
        this.projects = projects;
        this.filteredProjects = [...this.projects];
        this.totalProjects = this.projects.length;
        
        // If we have timesheet data, calculate project hours
        if (this.personalTimesheets.length > 0) {
          this.calculateProjectHours(this.personalTimesheets);
        }
      });
  }

  onDateRangeChange(): void {
    // Debounce the filter application to avoid too many API calls
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.loadPersonalTimesheets();
    }, 500);
  }

  resetFilters(): void {
    this.dateRange.reset({
      start: null,
      end: null,
      startTime: null,
      endTime: null,
      projectId: null,
      position: null
    });
    
    this.selectedProject = null;
    this.selectedPosition = null;
    this.loadPersonalTimesheets();
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
    this.loadPersonalTimesheets();
  }

  calculateProjectHours(timesheets: Timesheet[]): void {
    // Create a map to store project hours
    const projectHoursMap = new Map<string, number>();
    
    // Calculate total hours for each project
    timesheets.forEach(timesheet => {
      const projectId = timesheet.project;
      const hours = timesheet.hours || 0;
      
      if (projectId) {
        const currentHours = projectHoursMap.get(projectId) || 0;
        projectHoursMap.set(projectId, currentHours + hours);
      }
    });
    
    // Update projects with calculated hours
    this.projects = this.projects.map(project => {
      return {
        ...project,
        hours: projectHoursMap.get(project.projectId) || 0
      };
    });
    
    // Update filtered projects
    this.filteredProjects = [...this.projects];
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.projectId === projectId);
    return project ? project.name : projectId;
  }

  // Add this method to handle position selection
  selectPosition(position: string): void {
    this.selectedPosition = position;
    this.loadPersonalTimesheets();
  }
}