import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
    return this.http.get<Project[]>(this.apiEndpoints.getAllProjectAndTask).pipe(
      map(projects => {
        // Flatten all tasks from all projects into a single array
        const allTasks: Task[] = [];
        projects.forEach(project => {
          if (project.tasks && project.tasks.length > 0) {
            allTasks.push(...project.tasks);
          }
        });
        return allTasks;
      })
    );
  }

  /**
   * Get all tasks for a specific project
   * @param projectId Project ID
   * @returns Observable<Task[]>
   */
  getTasksByProjectId(projectId: string): Observable<Task[]> {
    return this.http.get<Project>(`${this.apiEndpoints.getAllProjectAndTask}/${projectId}`).pipe(
      map(project => project.tasks || [])
    );
  }
} 