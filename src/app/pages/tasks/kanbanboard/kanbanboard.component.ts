import { Component, OnInit, ViewChild } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';

import { memberList } from './data';
import { Task } from '../list/list.model';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-kanbanboard',
  templateUrl: './kanbanboard.component.html',
  styleUrls: ['./kanbanboard.component.scss']
})

/**
 * Kanbanboard Component
 */
export class KanbanboardComponent implements OnInit {
  upcomingTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  completedTasks: Task[] = [];
  memberLists: any;
  status: any;
  
  // API data
  tasks: Task[] = [];
  isLoading = false;
  projectId: string | null = null;

  // bread crumb items
  breadCrumbItems: Array<{}>;
  taskForm!: UntypedFormGroup;
  submitted = false;

  @ViewChild('modalForm', { static: false }) modalForm?: ModalDirective;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Kanban Board', active: true }];

    this.taskForm = this.formBuilder.group({
      id: [''],
      taskname: ['', [Validators.required]],
      taskdesc: ['', [Validators.required]],
      taskstatus: ['', [Validators.required]],
      taskbudget: ['', [Validators.required]],
      taskassignee: ['']
    });

    // Check if we have a projectId in the URL query params
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'];
      this.loadTasks();
    });
    
    // Load member lists
    this.memberLists = memberList;
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
        event.data.status = targetStatus;
        
        // Here you would usually make an API call to update the task status
        console.log('Task status updated:', event.data);
      }

      filteredList.splice(index, 0, event.data);
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

  // Delete Data
  delete(event: any) {
    event.target.closest('.card .task-box')?.remove();
  }

  // Select Member
  selectMember(id: any) {
    this.memberLists[id].checked = true;
    if (this.memberLists[id.checked] == true) {
      this.memberLists[id].checked = false;
    }
  }

  // add new tak  
  addnewTask(status: any) {
    this.status = status;
    this.modalForm.show();
  }

  // Save Form
  submitForm() {
    if (this.taskForm.valid) {
      if (this.taskForm.get('id')?.value) {
        // Edit existing task - would make API call here
        console.log('Update task:', this.taskForm.value);
      } else {
        // Create new task - would make API call here
        const title = this.taskForm.get('taskname')?.value;
        const description = this.taskForm.get('taskdesc')?.value;
        const priority = this.taskForm.get('taskstatus')?.value;
        
        console.log('Create new task:', {
          title,
          description,
          priority,
          status: this.status
        });
      }
    }
    
    this.taskForm.reset();
    this.modalForm.hide();
  }
}
