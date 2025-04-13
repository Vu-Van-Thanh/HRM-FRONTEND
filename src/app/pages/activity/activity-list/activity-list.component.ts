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

  constructor(
    private activityService: ActivityService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUserId();
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
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.personalDataSource.paginator = this.personalPaginator;
    this.personalDataSource.sort = this.personalSort;
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
} 