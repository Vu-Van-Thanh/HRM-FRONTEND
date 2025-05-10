import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Observable} from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder } from '@angular/forms';

import { Project, LegacyProject } from '../project.model';
import { ProjectService } from '../project.service';
import { ProjectgridService } from './projectgrid.service';
import { NgbdProjectGridSortableHeader, SortEvent } from './projectgrid-sortable.directive';

@Component({
  selector: 'app-projectgrid',
  templateUrl: './projectgrid.component.html',
  styleUrls: ['./projectgrid.component.scss'],
  providers: [ProjectgridService, DecimalPipe]
})

/**
 * Projects-grid component
 */
export class ProjectgridComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  projects: Project[] = [];
  isLoading = false;

  // Table data
  ordersList!: Observable<LegacyProject[]>;
  total: Observable<number>;
  @ViewChildren(NgbdProjectGridSortableHeader) headers!: QueryList<NgbdProjectGridSortableHeader>;

  constructor(
    private modalService: BsModalService,
    public service: ProjectgridService, 
    private formBuilder: UntypedFormBuilder,
    private projectService: ProjectService
  ) {
    this.ordersList = service.countries$;
    this.total = service.total$;
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Projects Grid', active: true }];
    this.loadProjects();
  }

  /**
   * Load all projects from API
   */
  loadProjects() {
    this.isLoading = true;
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        console.log('Projects data:', data);
        this.projects = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Get status class based on project status
   * @param status Project status
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
   * Get completion percentage based on tasks
   * @param project Project
   * @returns Completion percentage
   */
  getCompletionPercentage(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }
    
    const completedTasks = project.tasks.filter(
      task => task.status?.toLowerCase() === 'completed'
    ).length;
    
    return Math.round((completedTasks / project.tasks.length) * 100);
  }
}
