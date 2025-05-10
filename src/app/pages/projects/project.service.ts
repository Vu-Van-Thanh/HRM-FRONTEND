import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from './project.model';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiEndpoints = API_ENDPOINT;

  constructor(private http: HttpClient) { }

  /**
   * Get all projects including tasks
   * @returns Observable<Project[]>
   */
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiEndpoints.getAllProjectAndTask);
  }

  /**
   * Get project by ID
   * @param projectId Project ID
   * @returns Observable<Project>
   */
  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiEndpoints.getAllProjectAndTask}/${projectId}`);
  }
} 