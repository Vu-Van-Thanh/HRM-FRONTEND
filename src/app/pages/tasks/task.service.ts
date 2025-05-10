import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { Project } from '../projects/project.model';
import { Task } from './list/list.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiEndpoints = API_ENDPOINT;

  constructor(private http: HttpClient) { }

  /**
   * Get all tasks from all projects
   * @returns Observable<Task[]>
   */
  getAllTasks(): Observable<Task[]> {
    console.log('Calling API to get all projects and tasks:', this.apiEndpoints.getAllProjectAndTask);
    
    return this.http.get<Project[]>(this.apiEndpoints.getAllProjectAndTask).pipe(
      map(projects => {
        console.log('API response for all projects:', projects);
        // Flatten all tasks from all projects into a single array
        const allTasks: Task[] = [];
        if (Array.isArray(projects)) {
          projects.forEach(project => {
            if (project.tasks && project.tasks.length > 0) {
              // Add project name to each task for reference
              const tasksWithProject = project.tasks.map(task => ({
                ...task,
                projectName: project.name || 'Unknown Project'
              }));
              allTasks.push(...tasksWithProject);
            }
          });
        } else {
          console.error('API response is not an array:', projects);
        }
        console.log('Processed tasks:', allTasks);
        return allTasks;
      }),
      catchError(error => {
        console.error('Error fetching all tasks:', error);
        return throwError(() => new Error('Failed to load tasks. Please try again.'));
      })
    );
  }

  /**
   * Get all tasks for a specific project
   * @param projectId Project ID
   * @returns Observable<Task[]>
   */
  getTasksByProjectId(projectId: string): Observable<Task[]> {
    console.log('Calling API to get project by ID:', `${this.apiEndpoints.getAllProjectAndTask}/${projectId}`);
    
    return this.http.get<Project>(`${this.apiEndpoints.getAllProjectAndTask}/${projectId}`).pipe(
      map(project => {
        console.log('API response for project by ID:', project);
        if (project && project.tasks) {
          // Add project name to each task for reference
          return project.tasks.map(task => ({
            ...task,
            projectName: project.name || 'Unknown Project'
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
        return throwError(() => new Error('Failed to load project tasks. Please try again.'));
      })
    );
  }
} 