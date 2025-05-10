import { Component, OnInit, ViewChild } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';

import { memberList } from './data';
import { Task } from '../list/list.model';
import { TaskService } from '../task.service';
import { ProjectService } from '../../projects/project.service';
import { Project } from '../../projects/project.model';

@Component({
  selector: 'app-kanbanboard',
  templateUrl: './kanbanboard.component.html',
  styleUrls: ['./kanbanboard.component.scss']
})

/**
 * Kanbanboard Component
 */
export class KanbanboardComponent implements OnInit {
  // Task columns
  upcomingTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  completedTasks: Task[] = [];
  memberLists: any;
  status: any;
  
  // API data
  tasks: Task[] = [];
  isLoading = false;
  projectId: string | null = null;
  project: Project | null = null;
  error: string = '';
  
  // Analytics
  totalTasks = 0;
  highPriorityTasks = 0;
  mediumPriorityTasks = 0;
  lowPriorityTasks = 0;
  
  // Chart data
  taskStatusChart: any;
  taskPriorityChart: any;

  // bread crumb items
  breadCrumbItems: Array<{}>;
  taskForm!: UntypedFormGroup;
  submitted = false;

  @ViewChild('modalForm', { static: false }) modalForm?: ModalDirective;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Project Tasks', active: true }];

    this.taskForm = this.formBuilder.group({
      id: [''],
      taskname: ['', [Validators.required]],
      taskdesc: ['', [Validators.required]],
      taskstatus: ['', [Validators.required]],
      taskpriority: ['', [Validators.required]],
      taskassignee: ['']
    });

    // Initialize charts
    this.initializeCharts();

    // Check if we have a projectId in the URL query params
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'];
      if (this.projectId) {
        this.loadProjectDetails();
      } else {
        this.error = 'No project selected. Please select a project to view its tasks.';
      }
    });
    
    // Load member lists
    this.memberLists = memberList;
  }

  /**
   * Initialize chart data
   */
  initializeCharts() {
    // Task status distribution chart
    this.taskStatusChart = {
      series: [0, 0, 0], // Completed, In Progress, Upcoming
      chart: {
        height: 280,
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

    // Task priority distribution chart
    this.taskPriorityChart = {
      series: [0, 0, 0], // High, Medium, Low
      chart: {
        height: 280,
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
  }

  /**
   * Load project details and tasks
   */
  loadProjectDetails() {
    this.isLoading = true;
    
    if (!this.projectId) {
      this.isLoading = false;
      this.error = 'No project ID provided';
      return;
    }
    
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        console.log('Project loaded:', project);
        
        if (project.tasks && project.tasks.length > 0) {
          this.tasks = project.tasks.map(task => ({
            ...task,
            projectName: project.name || 'Unknown Project'
          }));
          this.filterTasksByStatus();
          this.calculateTaskStatistics();
          this.updateChartData();
        } else {
          this.error = 'No tasks found for this project';
        }
        
        // Update breadcrumb with project name
        this.breadCrumbItems = [
          { label: 'Projects', link: '/projects/list' },
          { label: project.name, link: `/projects/overview/${project.projectId}` },
          { label: 'Tasks', active: true }
        ];
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.error = 'Failed to load project details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  /**
   * on dragging task
   * @param item item dragged
   * @param list list from item dragged
   */
  onDragged(item: any, list: any[]) {
    const index = list.indexOf(item);
    list.splice(index, 1);
  }

  /**
   * On task drop event
   */
  onDrop(event: DndDropEvent, filteredList?: any[], targetStatus?: string) {
    if (filteredList && event.dropEffect === 'move') {
      let index = event.index;

      if (typeof index === 'undefined') {
        index = filteredList.length;
      }

      // Update task status when moved between columns
      if (targetStatus && event.data) {
        const newStatus = targetStatus === 'upcoming-task' ? 'pending' : 
                          targetStatus === 'Progress-task' ? 'in progress' : 
                          'completed';
        
        event.data.status = newStatus;
        
        // Here you would usually make an API call to update the task status
        console.log('Task status updated:', event.data);
        
        // Update statistics and charts after drag and drop
        this.calculateTaskStatistics();
        this.updateChartData();
      }

      filteredList.splice(index, 0, event.data);
    }
  }
  
  /**
   * Filter tasks by their status
   */
  filterTasksByStatus() {
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
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    if (!this.totalTasks) return 0;
    return Math.round((this.completedTasks.length / this.totalTasks) * 100);
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
   * Back to projects list
   */
  backToProjects() {
    this.router.navigate(['/projects/list']);
  }

  /**
   * Delete task
   */
  delete(event: any) {
    event.target.closest('.card .task-box')?.remove();
  }

  /**
   * Select Member
   */
  selectMember(id: any) {
    this.memberLists[id].checked = true;
    if (this.memberLists[id.checked] == true) {
      this.memberLists[id].checked = false;
    }
  }

  /**
   * Add new task
   */
  addnewTask(status: any) {
    this.status = status;
    this.modalForm?.show();
  }

  /**
   * Save Form
   */
  submitForm() {
    if (this.taskForm.valid) {
      if (this.taskForm.get('id')?.value) {
        // Edit existing task - would make API call here
        console.log('Update task:', this.taskForm.value);
      } else {
        // Create new task - would make API call here
        const title = this.taskForm.get('taskname')?.value;
        const description = this.taskForm.get('taskdesc')?.value;
        const priority = this.taskForm.get('taskpriority')?.value;
        
        console.log('Create new task:', {
          title,
          description,
          priority,
          status: this.status
        });
      }
    }
    
    this.taskForm.reset();
    this.modalForm?.hide();
  }
}
