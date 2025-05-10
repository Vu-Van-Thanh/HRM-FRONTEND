import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { overviewBarChart } from './data';
import { ChartType } from './overview.model';
import { Project, Task } from '../project.model';
import { ProjectService } from '../project.service';
import { EmployeeService, EmployeeInfo } from 'src/app/core/services/employee.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})

/**
 * Overview component
 */
export class OverviewComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  overviewBarChart: ChartType;
  
  // Project data
  projectId: string;
  project: Project;
  isLoading = false;
  error: string = '';
  
  // Task statistics
  totalTasks = 0;
  completedTasks = 0;
  inProgressTasks = 0;
  pendingTasks = 0;
  
  // Employee data
  teamMembers: EmployeeInfo[] = [];
  isLoadingTeam = false;
  assignedEmployees: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Projects Overview', active: true }];
    this.overviewBarChart = overviewBarChart;
    
    // Get projectId from URL
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      if (this.projectId) {
        this.loadProjectWithTeam(this.projectId);
      }
    });
  }
  
  /**
   * Load project details and team members
   * @param projectId Project ID
   */
  loadProjectWithTeam(projectId: string) {
    this.isLoading = true;
    this.isLoadingTeam = true;
    
    this.projectService.getProjectById(projectId).pipe(
      switchMap(project => {
        this.project = project;
        this.calculateTaskStatistics();
        this.updateChartData();
        
        // Get unique assigned employee IDs from tasks
        this.assignedEmployees = new Set();
        if (project.tasks && project.tasks.length > 0) {
          project.tasks.forEach(task => {
            if (task.assignedTo) {
              this.assignedEmployees.add(task.assignedTo);
            }
          });
        }
        
        // Load employee data for all assigned team members
        if (this.assignedEmployees.size > 0) {
          const employeeRequests = Array.from(this.assignedEmployees).map(employeeId => 
            this.employeeService.getEmployeeById(employeeId).pipe(
              catchError(() => of(null))
            )
          );
          return forkJoin(employeeRequests);
        }
        return of([]);
      }),
      catchError(err => {
        console.error('Error loading project:', err);
        this.error = 'Could not load project details. Please try again.';
        this.isLoading = false;
        this.isLoadingTeam = false;
        return of([]);
      })
    ).subscribe({
      next: (employees) => {
        this.teamMembers = employees.filter(e => e !== null);
        this.isLoading = false;
        this.isLoadingTeam = false;
      },
      error: () => {
        this.isLoading = false;
        this.isLoadingTeam = false;
      }
    });
  }
  
  /**
   * Calculate task statistics
   */
  calculateTaskStatistics() {
    if (this.project && this.project.tasks) {
      this.totalTasks = this.project.tasks.length;
      
      // Count tasks by status
      this.completedTasks = this.project.tasks.filter(
        task => task.status?.toLowerCase() === 'completed'
      ).length;
      
      this.inProgressTasks = this.project.tasks.filter(
        task => task.status?.toLowerCase() === 'in progress'
      ).length;
      
      this.pendingTasks = this.totalTasks - this.completedTasks - this.inProgressTasks;
    }
  }
  
  /**
   * Update chart data with task statistics
   */
  updateChartData() {
    if (this.overviewBarChart && this.overviewBarChart.series) {
      this.overviewBarChart.series = [
        {
          name: "Tasks",
          data: [this.totalTasks, this.completedTasks, this.inProgressTasks, this.pendingTasks]
        }
      ];
    }
  }
  
  /**
   * Get completion percentage
   * @returns Completion percentage
   */
  getCompletionPercentage(): number {
    if (!this.totalTasks) return 0;
    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }
  
  /**
   * Get tasks by priority
   * @param priority Priority level
   * @returns Tasks filtered by priority
   */
  getTasksByPriority(priority: string): Task[] {
    if (!this.project || !this.project.tasks) return [];
    
    return this.project.tasks.filter(
      task => task.priority?.toLowerCase() === priority.toLowerCase()
    );
  }
  
  /**
   * Get tasks assigned to a specific employee
   * @param employeeId Employee ID
   * @returns Tasks assigned to the employee
   */
  getTasksByEmployee(employeeId: string): Task[] {
    if (!this.project || !this.project.tasks) return [];
    
    return this.project.tasks.filter(
      task => task.assignedTo === employeeId
    );
  }
  
  /**
   * Get status class
   * @param status Status text
   * @returns CSS class name
   */
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-warning';
      case 'pending':
        return 'bg-info';
      case 'delayed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
  
  /**
   * Get priority class
   * @param priority Priority level
   * @returns CSS class name
   */
  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
  
  /**
   * Get employee full name
   * @param employee Employee info
   * @returns Full name
   */
  getEmployeeFullName(employee: EmployeeInfo): string {
    if (!employee) return 'Unknown';
    return `${employee.firstName} ${employee.lastName}`;
  }
  
  /**
   * Get employee initials for avatar
   * @param employee Employee info
   * @returns Initials
   */
  getEmployeeInitials(employee: EmployeeInfo): string {
    if (!employee) return 'U';
    return (employee.firstName.charAt(0) + employee.lastName.charAt(0)).toUpperCase();
  }
  
  /**
   * Format date string
   * @param dateString Date string
   * @returns Formatted date
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
}
