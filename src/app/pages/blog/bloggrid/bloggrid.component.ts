import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Facility } from '../blog.model';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

@Component({
  selector: 'app-bloggrid',
  templateUrl: './bloggrid.component.html',
  styleUrls: ['./bloggrid.component.scss']
})
export class BloggridComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  facilities: Facility[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Quản lý' }, { label: 'Thiết bị phòng ban', active: true }];
    this.loadFacilities();
  }

  loadFacilities() {
    this.loading = true;
    this.http.get<Facility[]>(API_ENDPOINT.getFacilities).subscribe({
      next: (data) => {
        this.facilities = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải dữ liệu thiết bị';
        this.loading = false;
        console.error('Error loading facilities:', error);
      }
    });
  }

  getConditionText(condition: number): string {
    switch(condition) {
      case 0: return 'Mới';
      case 1: return 'Tốt';
      case 2: return 'Trung bình';
      case 3: return 'Cần bảo trì';
      case 4: return 'Hỏng';
      default: return 'Không xác định';
    }
  }

  getConditionClass(condition: number): string {
    switch(condition) {
      case 0: return 'badge-soft-success';
      case 1: return 'badge-soft-info';
      case 2: return 'badge-soft-warning';
      case 3: return 'badge-soft-danger';
      case 4: return 'badge-soft-dark';
      default: return 'badge-soft-secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }
}
