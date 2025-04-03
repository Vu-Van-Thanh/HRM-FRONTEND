import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Activity, ActivityStatus, ActivityType } from '../models/activity.model';
import { ActivityService } from '../services/activity.service';
import { ActivityDetailDialogComponent } from '../activity-detail-dialog/activity-detail-dialog.component';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'employeeName',
    'departmentName',
    'type',
    'startDate',
    'endDate',
    'reason',
    'status',
    'actions'
  ];
  dataSource: MatTableDataSource<Activity> = new MatTableDataSource<Activity>([]);
  departments: string[] = [];
  activityTypes = Object.values(ActivityType);
  activityStatuses = Object.values(ActivityStatus);
  selectedDepartment: string = '';
  selectedType: ActivityType | '' = '';
  selectedStatus: ActivityStatus | '' = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private activityService: ActivityService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadActivities();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadActivities(): void {
    const params: any = {};
    if (this.selectedDepartment) {
      params.department = this.selectedDepartment;
    }
    if (this.selectedType) {
      params.type = this.selectedType;
    }
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    this.activityService.getActivities(params).subscribe({
      next: (activities) => {
        this.dataSource.data = activities;
        // Extract unique departments from activities
        this.departments = [...new Set(activities.map(activity => activity.departmentName))];
      },
      error: (error) => {
        console.error('Error loading activities:', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onFilterChange(): void {
    this.loadActivities();
  }

  onViewDetail(activity: Activity): void {
    const dialogRef = this.dialog.open(ActivityDetailDialogComponent, {
      width: '800px',
      data: { activity }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadActivities();
      }
    });
  }

  onApprove(activity: Activity): void {
    this.activityService.approveActivity(activity.id).subscribe({
      next: () => {
        this.loadActivities();
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
        this.loadActivities();
      }
    });
  }
} 