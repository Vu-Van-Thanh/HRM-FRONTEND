import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

interface JobCategory {
  positionName: string;
  level: string;
  description: string;
  departmentId: string;
  manager: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})

/**
 * Categories Component
 */
export class CategoriesComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  jobs: JobCategory[] = [];
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Tuyển dụng' },
      { label: 'Danh mục công việc', active: true }
    ];
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.error = null;
    
    this.http.get<JobCategory[]>(`${API_ENDPOINT.getAllJobInternal}`).subscribe({
      next: (data) => {
        this.jobs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách công việc. Vui lòng thử lại sau.';
        this.loading = false;
      }
    });
  }

}
