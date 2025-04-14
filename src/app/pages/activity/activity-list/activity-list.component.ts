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

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'employeeName',
    'departmentName',
    'activityType',
    'startDate',
    'endDate',
    'reason',
    'status',
    'actions'
  ];
  
  personalDisplayedColumns: string[] = [
    'activityType',
    'startDate',
    'endDate',
    'reason',
    'status',
    'actions'
  ];

  dataSource: MatTableDataSource<Activity> = new MatTableDataSource<Activity>([]);
  personalDataSource: MatTableDataSource<Activity> = new MatTableDataSource<Activity>([]);
  
  departments: string[] = [];
  activityTypes = Object.values(ActivityType);
  activityStatuses = Object.values(ActivityStatus);
  selectedDepartment: string = '';
  selectedActivityType: ActivityType | '' = '';
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

  constructor(
    private activityService: ActivityService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private fb: FormBuilder
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUserId();
    this.initWorkLogForm();
  }

  ngOnInit(): void {
    // Get activityType from route data
    this.route.data.subscribe(data => {
      if (data['activityType']) {
        this.selectedActivityType = data['activityType'];
      }
      this.loadActivities();
      this.loadPersonalActivities();
    });
    this.loadProjects();
    this.loadPositions();
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
    this.activityService.approveActivity(activity.id).subscribe({
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
        this.activityService.rejectActivity(activity.id, result.reason).subscribe({
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
          activityType: ActivityType.ATTENDANCE,
          status: 'PENDING',
          employeeId: this.currentUserId,
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
        activityType: ActivityType.ATTENDANCE,
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

        this.activityService.updateActivity(activity.id, updatedActivity).subscribe({
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
        this.activityService.deleteActivity(activity.id).subscribe({
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
} 