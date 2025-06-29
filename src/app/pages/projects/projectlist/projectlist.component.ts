import { Component, OnInit } from '@angular/core';
import { Project } from '../project.model';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.scss']
})

/**
 * Projects-list component
 */
export class ProjectlistComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  projects: Project[] = [];
  searchTerm: string = '';    
  page: any = 1;
  isLoading = false;
  
  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Projects List', active: true }];
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

   get filteredProjects(): Project[] {
    if (!this.searchTerm.trim()) {
      return this.projects;
    }
    const term = this.searchTerm.toLowerCase();
    return this.projects.filter(p =>
      p.name.toLowerCase().includes(term)
      || (p.description?.toLowerCase().includes(term))
      || (p.departmentName?.toLowerCase().includes(term))
    );
  }

  /** Gọi khi input thay đổi */
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }
}
