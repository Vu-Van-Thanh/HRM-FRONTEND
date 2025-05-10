import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';

import { Task } from './list.model';
import { TaskService } from '../task.service';
import { ProjectService } from '../../projects/project.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

/**
 * Tasks-list component - Shows all tasks from all projects
 */
export class ListComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;
  submitted = false;
  formData: UntypedFormGroup;
  
  // Chart data
  taskStatusChart: any;
  taskPriorityChart: any;
  timelineChart: any;
  projectDistributionChart: any;
  
  // Task data
  tasks: Task[] = [];
  upcomingTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  completedTasks: Task[] = [];
  
  // Analytics data
  totalTasks = 0;
  completedTasksCount = 0;
  overdueTasksCount = 0;
  highPriorityTasks = 0;
  mediumPriorityTasks = 0;
  lowPriorityTasks = 0;
  projectTaskCounts: {[key: string]: number} = {};
  
  isLoading = false;
  projectId: string | null = null;
  myFiles: string[] = [];

  constructor(
    private modalService: BsModalService, 
    private formBuilder: UntypedFormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'All Tasks', active: true }];

    this.formData = this.formBuilder.group({
      name: ['', [Validators.required]],
      file: new UntypedFormControl('', [Validators.required]),
      taskType: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    // Initialize chart data
    this.initializeChartData();

    // Check if we have a projectId in the URL query params
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'];
      console.log('Project ID from query params:', this.projectId);
      this.loadTasks();
    });
  }

  /**
   * Initialize chart data with default values
   */
  initializeChartData() {
    // Task status chart
    this.taskStatusChart = {
      series: [0, 0, 0], // Completed, In Progress, Upcoming
      chart: {
        height: 300,
        type: 'donut',
      },
      labels: ['Completed', 'In Progress', 'Upcoming'],
      colors: ['#34c38f', '#556ee6', '#f1b44c'],
      legend: {
        show: true,
        position: 'bottom',
      },
      dataLabels: {
        enabled: false
      }
    };
    
    // Task priority chart
    this.taskPriorityChart = {
      series: [0, 0, 0], // High, Medium, Low
      chart: {
        height: 300,
        type: 'pie',
      },
      labels: ['High', 'Medium', 'Low'],
      colors: ['#f46a6a', '#f1b44c', '#34c38f'],
      legend: {
        show: true,
        position: 'bottom',
      },
      dataLabels: {
        enabled: false
      }
    };
    
    // Timeline chart
    this.timelineChart = {
      series: [{
        name: 'Tasks',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }],
      chart: {
        height: 320,
        type: 'bar',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '30%',
        },
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      colors: ['#556ee6'],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      }
    };
    
    // Project distribution chart
    this.projectDistributionChart = {
      series: [],
      chart: {
        height: 320,
        type: 'bar',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: '80%',
        },
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#556ee6', '#34c38f', '#f1b44c', '#f46a6a', '#50a5f1'],
      xaxis: {
        categories: [],
      }
    };
  }

  onFileChange(event) {
    for (var i = 0; i < event.target.files.length; i++) {
      this.myFiles.push('assets/images/users/' + event.target.files[i].name);
    }
  }

  /**
   * Load tasks from API based on project filter
   */
  loadTasks() {
    this.isLoading = true;
    console.log('Loading tasks, projectId:', this.projectId);
    
    // If we have a projectId, load tasks for that project only
    if (this.projectId) {
      console.log('Fetching tasks for project:', this.projectId);
      this.taskService.getTasksByProjectId(this.projectId).subscribe({
        next: (tasks) => {
          console.log('Received tasks for project:', tasks);
          this.tasks = tasks;
          this.processTaskData();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading tasks for project:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.log('Fetching all tasks from all projects');
      // Otherwise load all tasks from all projects
      this.taskService.getAllTasks().subscribe({
        next: (tasks) => {
          console.log('Received all tasks:', tasks);
          this.tasks = tasks;
          this.processTaskData();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading all tasks:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  /**
   * Process task data - filter by status, calculate statistics, update charts
   */
  processTaskData() {
    this.filterTasksByStatus();
    this.calculateTaskStatistics();
    this.updateChartData();
  }
  
  /**
   * Filter tasks by their status
   */
  filterTasksByStatus() {
    console.log('Filtering tasks by status, total tasks:', this.tasks.length);
    
    if (!this.tasks || this.tasks.length === 0) {
      this.inprogressTasks = [];
      this.upcomingTasks = [];
      this.completedTasks = [];
      return;
    }
    
    // Filter tasks by status - case insensitive
    this.inprogressTasks = this.tasks.filter(task => 
      task.status && task.status.toLowerCase() === 'in progress'
    );
    
    this.upcomingTasks = this.tasks.filter(task => 
      task.status && (task.status.toLowerCase() === 'pending' || 
                    task.status.toLowerCase() === 'new')
    );
    
    this.completedTasks = this.tasks.filter(task => 
      task.status && task.status.toLowerCase() === 'completed'
    );
    
    console.log('Task counts - In Progress:', this.inprogressTasks.length, 
                'Upcoming:', this.upcomingTasks.length, 
                'Completed:', this.completedTasks.length);
  }

  /**
   * Calculate task statistics
   */
  calculateTaskStatistics() {
    this.totalTasks = this.tasks.length;
    this.completedTasksCount = this.completedTasks.length;
    
    // Count overdue tasks
    const today = new Date();
    this.overdueTasksCount = this.tasks.filter(task => 
      task.status && 
      task.status.toLowerCase() !== 'completed' && 
      task.deadline && 
      new Date(task.deadline) < today
    ).length;
    
    // Count tasks by priority
    this.highPriorityTasks = this.tasks.filter(task => 
      task.priority && task.priority.toLowerCase() === 'high'
    ).length;
    
    this.mediumPriorityTasks = this.tasks.filter(task => 
      task.priority && task.priority.toLowerCase() === 'medium'
    ).length;
    
    this.lowPriorityTasks = this.tasks.filter(task => 
      task.priority && task.priority.toLowerCase() === 'low'
    ).length;
    
    // Count tasks by project
    this.projectTaskCounts = {};
    this.tasks.forEach(task => {
      if (task.projectName) {
        if (!this.projectTaskCounts[task.projectName]) {
          this.projectTaskCounts[task.projectName] = 0;
        }
        this.projectTaskCounts[task.projectName]++;
      }
    });
  }

  /**
   * Update chart data
   */
  updateChartData() {
    // Update status chart
    if (this.taskStatusChart) {
      this.taskStatusChart.series = [
        this.completedTasks.length,
        this.inprogressTasks.length,
        this.upcomingTasks.length
      ];
    }
    
    // Update priority chart
    if (this.taskPriorityChart) {
      this.taskPriorityChart.series = [
        this.highPriorityTasks,
        this.mediumPriorityTasks,
        this.lowPriorityTasks
      ];
    }
    
    // Update timeline chart
    if (this.timelineChart) {
      const monthCounts = Array(12).fill(0);
      
      this.tasks.forEach(task => {
        if (task.createdAt) {
          const date = new Date(task.createdAt);
          const month = date.getMonth();
          monthCounts[month]++;
        }
      });
      
      this.timelineChart.series = [{
        name: 'Tasks',
        data: monthCounts
      }];
    }
    
    // Update project distribution chart
    if (this.projectDistributionChart) {
      const projects = Object.keys(this.projectTaskCounts);
      const counts = projects.map(project => this.projectTaskCounts[project]);
      
      // Sort projects by task count
      const sortedProjects = projects.map((project, index) => ({
        project,
        count: counts[index]
      })).sort((a, b) => b.count - a.count);
      
      // Limit to top 5 projects
      const topProjects = sortedProjects.slice(0, 5);
      
      this.projectDistributionChart.series = [{
        data: topProjects.map(p => p.count)
      }];
      
      this.projectDistributionChart.xaxis = {
        categories: topProjects.map(p => p.project)
      };
    }
  }

  /**
   * Navigate to project details
   * @param projectId Project ID
   */
  viewProject(projectId: string) {
    this.router.navigate(['/projects/overview', projectId]);
  }

  /**
   * View tasks for a specific project
   * @param projectId Project ID
   */
  viewProjectTasks(projectId: string) {
    this.router.navigate(['/tasks/kanban'], { 
      queryParams: { projectId: projectId }
    });
  }

  /**
   * Get completion percentage
   * @returns Completion percentage
   */
  getCompletionPercentage(): number {
    if (!this.totalTasks) return 0;
    return Math.round((this.completedTasksCount / this.totalTasks) * 100);
  }

  /**
   * Get priority class for badge
   * @param priority Task priority
   * @returns CSS class
   */
  getPriorityClass(priority: string): string {
    if (!priority) return 'bg-secondary';
    
    switch(priority.toLowerCase()) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-info';
    }
  }

  /**
   * Get status class for badge
   * @param status Task status
   * @returns CSS class
   */
  getStatusClass(status: string): string {
    if (!status) return 'bg-secondary';
    
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-warning';
      case 'pending':
      case 'new':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
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

  /**
   * Check if task is overdue
   * @param task Task
   * @returns True if overdue
   */
  isOverdue(task: Task): boolean {
    if (task.status?.toLowerCase() === 'completed') return false;
    if (!task.deadline) return false;
    
    const today = new Date();
    const deadline = new Date(task.deadline);
    return deadline < today;
  }

  get form() {
    return this.formData.controls;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }
}
