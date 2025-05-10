import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';

import { taskChart } from './data';
import { ChartType, Task } from './list.model';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

/**
 * Tasks-list component
 */
export class ListComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  modalRef?: BsModalRef;
  submitted = false;
  formData: UntypedFormGroup;
  taskChart: ChartType;
  
  // Task data
  tasks: Task[] = [];
  upcomingTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  completedTasks: Task[] = [];
  
  isLoading = false;
  projectId: string | null = null;
  myFiles: string[] = [];

  constructor(
    private modalService: BsModalService, 
    private formBuilder: UntypedFormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Task List', active: true }];

    this.formData = this.formBuilder.group({
      name: ['', [Validators.required]],
      file: new UntypedFormControl('', [Validators.required]),
      taskType: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    // Check if we have a projectId in the URL query params
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'];
      this.loadTasks();
    });
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
    
    // If we have a projectId, load tasks for that project only
    if (this.projectId) {
      this.taskService.getTasksByProjectId(this.projectId).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.filterTasksByStatus();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading tasks for project:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Otherwise load all tasks from all projects
      this.taskService.getAllTasks().subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.filterTasksByStatus();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading all tasks:', error);
          this.isLoading = false;
        }
      });
    }
    
    // Set up chart data
    this.taskChart = taskChart;
  }
  
  /**
   * Filter tasks by their status
   */
  filterTasksByStatus() {
    // Filter tasks by status
    this.inprogressTasks = this.tasks.filter(t => 
      t.status?.toLowerCase() === 'in progress'
    );
    
    this.upcomingTasks = this.tasks.filter(t => 
      t.status?.toLowerCase() === 'pending' || 
      t.status?.toLowerCase() === 'new'
    );
    
    this.completedTasks = this.tasks.filter(t => 
      t.status?.toLowerCase() === 'completed'
    );
    
    // Update chart data
    if (this.taskChart && this.taskChart.series) {
      this.taskChart.series = [
        this.completedTasks.length,
        this.inprogressTasks.length,
        this.upcomingTasks.length
      ];
    }
  }

  /**
   * Get priority class for badge
   * @param priority Task priority
   * @returns CSS class
   */
  getPriorityClass(priority: string): string {
    switch(priority?.toLowerCase()) {
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
