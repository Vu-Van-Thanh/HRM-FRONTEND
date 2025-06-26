import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexStroke
} from 'ng-apexcharts';

@Component({
  selector: 'app-filemanager',
  templateUrl: './filemanager.component.html',
  styleUrls: ['./filemanager.component.scss']
})
export class FilemanagerComponent implements OnInit {
  employeeCollapsed = false;
  departmentCollapsed = false;
  searchTerm = '';
  selectedFolderLabel = '';
  selectedKey = '';
  loading = false;

  groupedFiles: { [key: string]: any[] } = {}; 

  employeeFolders = [
    { key: 'employeeavatarprofile', label: 'Avatar Nhân viên' },
    { key: 'employeecontracts', label: 'Hợp đồng' },
    { key: 'identitycard', label: 'CMND / Hộ chiếu' },
    { key: 'employeeprofile', label: 'Hồ sơ nhân viên' }
  ];

  departmentFolders = [
    { key: 'cv', label: 'CV ứng viên' },
    { key: 'article', label: 'Bài viết nội bộ' },
    { key: 'project', label: 'Tài liệu dự án' },
    { key: 'task', label: 'Tài liệu nhiệm vụ' }
  ];

  files: any[] = [];
  filteredFiles: any[] = [];

  // Dữ liệu bộ nhớ
  totalStorage = 64; // GB
  usedStorage = 0;
  chartSeries: ApexNonAxisChartSeries = [];
  chartOptions: {
    chart: ApexChart;
    plotOptions: ApexPlotOptions;
    stroke: ApexStroke;
    labels: string[];
    colors: string[];
  } = {
    chart: {
      type: 'radialBar',
      height: 250,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px'
          },
          value: {
            show: true,
            fontSize: '18px',
            formatter: (val: number) => val.toFixed(1) + '%'
          }
        }
      },
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['Đã dùng'],
    colors: ['#556ee6'],
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const percent = (this.usedStorage / this.totalStorage) * 100;
    this.chartSeries = [percent];
    this.loadEmployeeMedia();
    this.loadDepartmentFiles();
  }

  searchFiles() {
    const keyword = this.searchTerm.toLowerCase();
    this.filteredFiles = this.files.filter(f =>
      (f.MediaUrl || '').toLowerCase().includes(keyword)
    );
  }

  loadFiles(folder: { key: string; label: string }) {
    this.selectedKey = folder.key;
    this.selectedFolderLabel = folder.label;
    this.loading = true;

    const data = this.groupedFiles[folder.key.toLowerCase()];
    if (data) {
      this.files = data;
      this.filteredFiles = data;
      this.searchTerm = '';
    }

    this.loading = false;
  }

  /*loadEmployeeMedia() {
  const rawQuery = `
    SELECT EmployeeMediaID, MediaType, EmployeeID, MediaUrl
    FROM EmployeeMedias
  `;
  const body = JSON.stringify(rawQuery);
  this.loading = true;

  this.http.post<any[]>('https://localhost:7214/api/dynamic/execute-query', body, {
    headers: { 'Content-Type': 'application/json' }
  }).subscribe(res => {
    this.groupedFiles = {};
    const allFolderKeys = [...this.employeeFolders, ...this.departmentFolders].map(f => f.key.toLowerCase());

    for (let file of res) {
      const url = (file.MediaUrl || '').toLowerCase();
      const segments = url.split('/');
      const fileName = segments[segments.length - 1] || 'unnamed';

      // Tìm folder key phù hợp có xuất hiện trong URL
      const matchedKey = allFolderKeys.find(key => url.includes(key));

      if (matchedKey) {
        const enriched = {
          ...file,
          name: fileName,
          folder: matchedKey,
          MediaUrl: `https://localhost:7214${file.MediaUrl}`
        };

        if (!this.groupedFiles[matchedKey]) {
          this.groupedFiles[matchedKey] = [];
        }

        this.groupedFiles[matchedKey].push(enriched);
      }
    }

    this.loading = false;
    this.recalculateUsedStorage();
  }, _ => this.loading = false);
}*/
loadEmployeeMedia() {
  const folderMap = {
    employeeavatarprofile: 'EmployeeAvatarProfile',
    employeecontracts: 'EmployeeContracts',
    identitycard: 'IdentityCard',
    employeeprofile: 'EmployeeProfile'
  };

  const baseUrl = 'https://localhost:7214/api/Dynamic/Statistic/Uploads';
  this.loading = true;

  const requests = Object.entries(folderMap).map(([key, path]) =>
    this.http.get<any[]>(`${baseUrl}/${path}`).toPromise().then(files => {
      this.groupedFiles[key] = (files || []).map(file => ({
        ...file,
        folder: key,
        MediaUrl: `https://localhost:7214${file.fullPath}` // thêm domain
      }));
    })
  );

  Promise.all(requests)
    .then(() => {
      this.recalculateUsedStorage();
      this.loading = false;
    })
    .catch(() => this.loading = false);
}


loadDepartmentFiles() {
  const folderMap = {
    cv: 'AppliedCV',
    article: 'ArticleUpload',
    project: 'ProjectAttachments',
    task: 'TaskAttachments'
  };

  const departmentBaseUrl = 'https://localhost:7176/Department/Statistic';

  this.loading = true;
  this.groupedFiles = { ...this.groupedFiles }; 
    const requests = Object.entries(folderMap).map(([key, path]) =>
    this.http.get<any[]>(`${departmentBaseUrl}/${path}`).toPromise().then(files => {
      this.groupedFiles[key] = (files || []).map(file => ({
        ...file,
        folder: key,
        MediaUrl: `https://localhost:7176${file.fullPath}`
      }));
    })
  );

  Promise.all(requests)
  .then(() => {
    this.recalculateUsedStorage();
    this.loading = false;
  })
  .catch(() => this.loading = false);
}

private recalculateUsedStorage() {
  let totalBytes = 0;
  for (const files of Object.values(this.groupedFiles)) {
    for (const file of files) {
      if (file.size && typeof file.size === 'number') {
        totalBytes += file.size;
      }
    }
  }

  this.usedStorage = +(totalBytes / (1024 ** 3)).toFixed(2);
  const percent = (this.usedStorage / this.totalStorage) * 100;
  this.chartSeries = [percent];
}
}
