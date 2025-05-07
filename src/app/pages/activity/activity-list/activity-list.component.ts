import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Activity, ActivityStatus, ActivityType } from '../models/activity.model';
import { ActivityService } from '../services/activity.service';
import { ActivityDetailDialogComponent } from '../activity-detail-dialog/activity-detail-dialog.component';
import { AuthenticationService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from '../models/project.model';
import { Position } from '../models/position.model';
import { WorkLogDialogComponent } from '../work-log-dialog/work-log-dialog.component';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { HttpClient } from '@angular/common/http';
import { DepartmentService } from '../../../system/department/department.service';
import { Department } from '../../../system/department/department.model';
import { EmployeeDepartmentDTO } from 'src/app/system/salary/salary.model';
import { tap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, AfterViewInit {
  //departments: Department[] = [];
  employeeList: EmployeeDepartmentDTO[] = [];
  displayedColumns: string[] = [
    'employeeName',
    'departmentName',
    'activityType',
    'taskName',
    'startTime',
    'endTime',
    'estimatedHours',
    'status',
    'actions'
  ];
  
  personalDisplayedColumns: string[] = [
    'activityType',
    'taskName',
    'startTime',
    'endTime',
    'estimatedHours',
    'status',
    'actions'
  ];

  dataSource: MatTableDataSource<Activity> = new MatTableDataSource<Activity>([]);
  personalDataSource: MatTableDataSource<Activity> = new MatTableDataSource<Activity>([]);
  
  departments: string[] = [];
  departmentsList: Department[] = [];
  activityTypes: ActivityType[] = [];
  activityStatuses = Object.values(ActivityStatus);
  selectedDepartment: string = '';
  selectedActivityType: string | '' = '';
  selectedStatus: ActivityStatus | '' = '';
  
  activeTab: 'all' | 'personal' = 'all';
  isAdmin = false;
  currentUserId: number;

  @ViewChild('allPaginator') paginator: MatPaginator;
  @ViewChild('personalPaginator') personalPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('personalSort') personalSort: MatSort;

  workLogForm: FormGroup;
  showWorkLogForm = false;

  projects: Project[] = [];
  positions: Position[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Add new filter form
  advancedFilterForm: FormGroup;
  filteredActivities: Activity[] = [];
  filteredEmployees: EmployeeDepartmentDTO[] = [];
  filteredDepartments: Department[] = [];
  isLoading = false;

  constructor(
    private activityService: ActivityService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private http: HttpClient,
    private departmentService: DepartmentService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUserId();
    this.initWorkLogForm();
    
    // Initialize advanced filter form
    this.advancedFilterForm = this.fb.group({
      managerID: [''],
      departmentID: [''],
      employeeID: [''],
      activityType: [''],
      activityStatus: [''],
      startTime: [''],
      endTime: ['']
    });
  }

  ngOnInit(): void {
    // Tải loại hoạt động từ API
    this.activityService.getActivityTypes().subscribe(types => {
      this.activityTypes = types;
      
      // Get activityType from route data
      this.route.data.subscribe(data => {
        if (data['activityType']) {
          this.selectedActivityType = data['activityType'];
        }
        this.loadActivities();
        this.loadPersonalActivities();
      });
    });
    
    this.loadProjects();
    this.loadPositions();
    this.loadDepartments();
    this.loadEmployeeData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.personalDataSource.paginator = this.personalPaginator;
    this.personalDataSource.sort = this.personalSort;
  }

  initWorkLogForm(): void {
    this.workLogForm = this.fb.group({
      projectId: ['', Validators.required],
      positionId: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date(), Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  loadProjects(): void {
    // TODO: Replace with actual API call
    this.projects = [
      {
        id: 1,
        name: 'Dự án A',
        description: 'Mô tả dự án A',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        managerId: 1,
        managerName: 'Nguyễn Văn A',
        departmentId: 1,
        departmentName: 'Phòng Phát triển',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        name: 'Dự án B',
        description: 'Mô tả dự án B',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-12-31'),
        status: 'COMPLETED',
        managerId: 2,
        managerName: 'Trần Thị B',
        departmentId: 2,
        departmentName: 'Phòng QA',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 3,
        name: 'Dự án C',
        description: 'Mô tả dự án C',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        status: 'SUSPENDED',
        managerId: 3,
        managerName: 'Lê Văn C',
        departmentId: 3,
        departmentName: 'Phòng Design',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      }
    ];
  }

  loadPositions(): void {
    // TODO: Replace with actual API call
    this.positions = [
      {
        id: 1,
        name: 'Developer',
        description: 'Lập trình viên',
        departmentId: 1,
        departmentName: 'Phòng Phát triển',
        level: 'SENIOR',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        name: 'Tester',
        description: 'Kiểm thử viên',
        departmentId: 2,
        departmentName: 'Phòng QA',
        level: 'MIDDLE',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 3,
        name: 'Designer',
        description: 'Thiết kế viên',
        departmentId: 3,
        departmentName: 'Phòng Design',
        level: 'JUNIOR',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }

  loadActivities(): void {
    const params: any = {};
    if (this.selectedDepartment) {
      params.department = this.selectedDepartment;
    }
    if (this.selectedActivityType) {
      params.activityType = this.selectedActivityType;
    }
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    this.activityService.getActivities(params).subscribe({
      next: (activities) => {
        this.dataSource.data = activities;
        this.departments = [...new Set(activities.map(activity => activity.departmentName))];
      },
      error: (error) => {
        console.error('Error loading activities:', error);
      }
    });
  }

  loadPersonalActivities(): void {
    const params: any = {
      employeeId: this.currentUserId
    };
    if (this.selectedActivityType) {
      params.activityType = this.selectedActivityType;
    }
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    this.activityService.getActivities(params).subscribe({
      next: (activities) => {
        this.personalDataSource.data = activities;
      },
      error: (error) => {
        console.error('Error loading personal activities:', error);
      }
    });
  }

  onFilterChange(): void {
    if (this.activeTab === 'all') {
      this.loadActivities();
    } else {
      this.loadPersonalActivities();
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.activeTab === 'all') {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    } else {
      this.personalDataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  onTabChange(tab: 'all' | 'personal'): void {
    this.activeTab = tab;
    if (tab === 'all') {
      this.loadActivities();
    } else {
      this.loadPersonalActivities();
    }
  }

  onViewDetail(activity: Activity): void {
    const dialogRef = this.dialog.open(ActivityDetailDialogComponent, {
      width: '800px',
      data: { activity }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadActivities();
        this.loadPersonalActivities();
      }
    });
  }

  onApprove(activity: Activity): void {
    this.activityService.approveActivity(activity.requestId).subscribe({
      next: () => {
        this.loadActivities();
        this.loadPersonalActivities();
      },
      error: (error) => {
        console.error('Error approving activity:', error);
      }
    });
  }

  onReject(activity: Activity): void {
    const dialogRef = this.dialog.open(ActivityDetailDialogComponent, {
      width: '500px',
      data: { 
        activity,
        isReject: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activityService.rejectActivity(activity.requestId, result.reason).subscribe({
          next: () => {
            this.loadActivities();
            this.loadPersonalActivities();
          },
          error: (error) => {
            console.error('Error rejecting activity:', error);
          }
        });
      }
    });
  }

  onAddWorkLog(): void {
    const dialogRef = this.dialog.open(WorkLogDialogComponent, {
      width: '600px',
      data: {
        projects: this.projects,
        positions: this.positions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Tạo object activity từ form data
        const activity = {
          ...result,
          activityType: 'ATTENDANCE',
          status: 'PENDING',
          employeeId: this.currentUserId.toString(),
          employeeName: 'Nguyễn Văn A', // TODO: Lấy tên thật từ AuthService
          projectName: this.projects.find(p => p.id === result.projectId)?.name,
          positionName: this.positions.find(p => p.id === result.positionId)?.name,
          date: result.date,
          startTime: result.startTime,
          endTime: result.endTime,
          description: result.description
        };

        // Gọi API để lưu activity
        this.activityService.createActivity(activity).subscribe({
          next: (response) => {
            // Thêm activity mới vào dataSource
            const currentData = this.personalDataSource.data;
            this.personalDataSource.data = [activity, ...currentData];
            
            // Hiển thị thông báo thành công
            console.log('Khai công thành công');
          },
          error: (error) => {
            console.error('Lỗi khi khai công:', error);
          }
        });
      }
    });
  }

  onCancelWorkLog(): void {
    this.showWorkLogForm = false;
    this.workLogForm.reset();
  }

  onSubmitWorkLog(): void {
    if (this.workLogForm.valid) {
      const workLog = {
        ...this.workLogForm.value,
        activityType: 'ATTENDANCE',
        status: 'PENDING'
      };

      // TODO: Replace with actual API call
      this.activityService.createActivity(workLog).subscribe(
        response => {
          this.showWorkLogForm = false;
          this.workLogForm.reset();
          this.loadActivities();
          // Show success message
        },
        error => {
          // Show error message
        }
      );
    }
  }

  onEditActivity(activity: Activity): void {
    const dialogRef = this.dialog.open(WorkLogDialogComponent, {
      width: '600px',
      data: {
        projects: this.projects,
        positions: this.positions,
        activity: activity,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Cập nhật activity
        const updatedActivity = {
          ...activity,
          ...result,
          projectName: this.projects.find(p => p.id === result.projectId)?.name,
          positionName: this.positions.find(p => p.id === result.positionId)?.name,
        };

        this.activityService.updateActivity(activity.requestId, updatedActivity).subscribe({
          next: () => {
            // Cập nhật lại danh sách
            this.loadPersonalActivities();
            console.log('Cập nhật khai công thành công');
          },
          error: (error) => {
            console.error('Lỗi khi cập nhật khai công:', error);
          }
        });
      }
    });
  }

  onDeleteActivity(activity: Activity): void {
    if (activity.activityType !== 'ATTENDANCE') {
      return;
    }

    const dialogRef = this.dialog.open(ActivityDetailDialogComponent, {
      width: '400px',
      data: { 
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa khai công này không?',
        activity,
        isDelete: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activityService.deleteActivity(activity.requestId).subscribe({
          next: () => {
            // Cập nhật lại danh sách hoạt động
            this.loadPersonalActivities();
            
            // Hiển thị thông báo thành công
            console.log('Xóa khai công thành công');
          },
          error: (error) => {
            console.error('Lỗi khi xóa khai công:', error);
          }
        });
      }
    });
  }

  /**
   * Tải danh sách phòng ban từ API
   */
  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe(
      departments => {
        console.log('📁 Danh sách phòng ban:', departments);
        this.departmentsList = departments;
      },
      error => {
        console.error('❌ Lỗi khi tải dữ liệu phòng ban:', error);
        this.departmentsList = [];
      }
    );
  }

  /**
   * Tải danh sách nhân viên từ API theo bộ lọc
   */
  loadEmployeeData(): void {
    const formValues = this.advancedFilterForm.value;
    
    const employeeFilter = {
      department: formValues.departmentID || '',
      jobTitle: '',
      managerId: formValues.managerID || '',
      employeeId: formValues.employeeID || ''
    };

    console.log('🔍 Áp dụng bộ lọc nhân viên:', employeeFilter);

    // Tải danh sách nhân viên dựa trên bộ lọc
    this.http.get<EmployeeDepartmentDTO[]>(API_ENDPOINT.getEmployeeID, { params: employeeFilter })
      .pipe(
        tap(employees => {
          console.log('📌 Danh sách nhân viên sau khi lọc:', employees);
          this.employeeList = employees;
        })
      )
      .subscribe({
        error: error => {
          console.error('❌ Lỗi khi tải dữ liệu nhân viên:', error);
        }
      });
  }

  
  loadActivityDataWithFilters(): void {
    this.isLoading = true;
    // Tạo bản sao của form value để không ảnh hưởng đến form gốc
    const filters = { ...this.advancedFilterForm.value };

    // Gọi service để lấy dữ liệu
    this.activityService.getActivityDataWithFilters(filters).subscribe({
      next: (data) => {
        this.filteredDepartments = data.departments;
        this.filteredEmployees = data.employees;
        
        // Xử lý dữ liệu từ API để phù hợp với model
        const activities: Activity[] = data.activities.map(item => {
          let activityType = item.activityId; // Gán activityType = activityId
          let reason = '';
          let taskName = '';
          let estimatedHours = 0;
          
          // Parse requestFlds nếu có
          if (item.requestFlds) {
            try {
              const requestFldsObj = JSON.parse(item.requestFlds);
              reason = requestFldsObj.TaskName || '';
              taskName = requestFldsObj.TaskName || '';
              estimatedHours = requestFldsObj.EstimatedHours || 0;
            } catch (e) {
              console.error('Lỗi khi parse requestFlds:', e);
            }
          }
          
          return {
            ...item,
            employeeName: this.getEmployeeName(item.employeeId),
            departmentName: this.getDepartmentName(Number(item.employeeId)),
            activityType: activityType,
            taskName: taskName,
            estimatedHours: estimatedHours,
            reason: reason
          };
        });
        
        // Cập nhật danh sách hoạt động
        this.filteredActivities = activities;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Áp dụng bộ lọc nâng cao
   */
  applyAdvancedFilter(): void {
    this.loadActivityDataWithFilters();
  }

  /**
   * Reset bộ lọc nâng cao
   */
  resetAdvancedFilter(): void {
    this.advancedFilterForm.reset({
      managerID: '',
      departmentID: '',
      employeeID: '',
      activityType: '',
      activityStatus: '',
      startTime: '',
      endTime: ''
    });
    
    this.loadActivityDataWithFilters();
  }

  /**
   * Lấy tên nhân viên từ ID
   */
  getEmployeeName(employeeId?: string): string {
    if (!employeeId) return 'N/A';
    const employee = this.employeeList.find(e => e.employeeID === employeeId);
    return employee?.employeeName || 'N/A';
  }

  /**
   * Lấy tên phòng ban từ ID
   */
  getDepartmentName(departmentId?: number): string {
    if (!departmentId) return 'N/A';
    const department = this.departmentsList.find(d => d.id === departmentId);
    return department?.name || 'N/A';
  }

  // Phương thức lấy tên của loại hoạt động
  getActivityTypeName(activity: Activity): string {
    if (!activity.activityType) return '';
    
    const activityTypeObj = this.activityTypes.find(type => type.activityId === activity.activityType || type.activityType === activity.activityType);
    return activityTypeObj ? activityTypeObj.activityDescription : activity.activityType;
  }

  // Phương thức định dạng thời gian
  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('vi-VN');
  }

  // Phương thức lấy trạng thái hiển thị
  getStatusDisplay(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ phê duyệt';
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  }

  // Phương thức lấy class cho trạng thái
  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'badge bg-warning';
      case 'APPROVED':
        return 'badge bg-success';
      case 'REJECTED':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
} 