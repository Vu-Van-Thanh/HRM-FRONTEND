import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { InternalInfo } from '../models/internal-info.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternalInfoService {
  private apiUrl = `${environment.apiBaseUrl}/internal-info`;

  // Mock data
  private mockInternalInfos: InternalInfo[] = [
    {
      id: 1,
      title: 'Thông báo về lịch nghỉ Tết Nguyên đán',
      content: 'Công ty sẽ nghỉ Tết từ ngày 10/02/2024 đến ngày 17/02/2024. Nhân viên trở lại làm việc từ ngày 18/02/2024.',
      departmentId: 1,
      departmentName: 'Phòng Nhân sự',
      createdBy: 1,
      createdByName: 'Admin',
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25'),
      isActive: true,
      documentId: 'doc123'
    },
    {
      id: 2,
      title: 'Kế hoạch đào tạo nhân viên mới',
      content: 'Phòng Nhân sự sẽ tổ chức khóa đào tạo cho nhân viên mới vào ngày 15/04/2024. Các trưởng phòng vui lòng báo cáo danh sách nhân viên mới tham gia.',
      departmentId: 1,
      departmentName: 'Phòng Nhân sự',
      createdBy: 1,
      createdByName: 'Admin',
      createdAt: new Date('2024-03-26'),
      updatedAt: new Date('2024-03-26'),
      isActive: true,
      documentId: 'doc456'
    },
    {
      id: 3,
      title: 'Thông báo về việc nâng cấp hệ thống',
      content: 'Phòng IT sẽ tiến hành nâng cấp hệ thống vào ngày 20/04/2024. Hệ thống sẽ tạm ngưng hoạt động từ 22:00 đến 06:00 sáng hôm sau.',
      departmentId: 3,
      departmentName: 'Phòng IT',
      createdBy: 1,
      createdByName: 'Admin',
      createdAt: new Date('2024-03-27'),
      updatedAt: new Date('2024-03-27'),
      isActive: true,
      documentId: 'doc789'
    },
    {
      id: 4,
      title: 'Kế hoạch marketing quý 2',
      content: 'Phòng Marketing sẽ triển khai chiến dịch marketing mới vào đầu quý 2. Các phòng ban liên quan vui lòng phối hợp theo yêu cầu.',
      departmentId: 4,
      departmentName: 'Phòng Marketing',
      createdBy: 1,
      createdByName: 'Admin',
      createdAt: new Date('2024-03-28'),
      updatedAt: new Date('2024-03-28'),
      isActive: true,
      documentId: 'doc101'
    }
  ];

  constructor(private http: HttpClient) { }

  getInternalInfos(params?: any): Observable<InternalInfo[]> {
    // Return mock data instead of making HTTP request
    let filteredInfos = [...this.mockInternalInfos];

    if (params) {
      if (params.department) {
        filteredInfos = filteredInfos.filter(info => 
          info.departmentName === params.department
        );
      }
    }

    return of(filteredInfos);
  }

  getInternalInfoById(id: number): Observable<InternalInfo> {
    const info = this.mockInternalInfos.find(i => i.id === id);
    return of(info!);
  }

  createInternalInfo(info: Partial<InternalInfo>): Observable<InternalInfo> {
    const newInfo: InternalInfo = {
      id: this.mockInternalInfos.length + 1,
      title: info.title || '',
      content: info.content || '',
      departmentId: info.departmentId || 0,
      departmentName: info.departmentName || '',
      createdBy: 1, // Mock admin ID
      createdByName: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      documentId: info.documentId || ''
    };
    
    this.mockInternalInfos.push(newInfo);
    return of(newInfo);
  }

  updateInternalInfo(id: number, info: Partial<InternalInfo>): Observable<InternalInfo> {
    const existingInfo = this.mockInternalInfos.find(i => i.id === id);
    if (existingInfo) {
      Object.assign(existingInfo, info);
      existingInfo.updatedAt = new Date();
    }
    return of(existingInfo!);
  }

  deleteInternalInfo(id: number): Observable<void> {
    const index = this.mockInternalInfos.findIndex(i => i.id === id);
    if (index !== -1) {
      this.mockInternalInfos.splice(index, 1);
    }
    return of(void 0);
  }

  getDepartments(): string[] {
    return [...new Set(this.mockInternalInfos.map(info => info.departmentName))];
  }

  // Method to get Word document content as HTML
  getWordDocumentContent(documentId: string): Observable<string> {
    // In a real application, you would use the HTTP client to fetch the document content from the backend
    // return this.http.get<string>(`${this.apiUrl}/document/${documentId}`);
    
    // For now, we'll return mock HTML content
    return of(`
      <div class="word-document">
        <h1>Sample Word Document</h1>
        <p>This is a sample Word document content converted to HTML.</p>
        <h2>Section 1</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
        <h2>Section 2</h2>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <table>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
          </tr>
        </table>
      </div>
    `);
  }
  
  // Method to upload a Word document
  uploadFile(formData: FormData): Observable<string> {
    // In a real application, you would use the HTTP client to upload the file to the backend
    // return this.http.post<{documentId: string}>(`${this.apiUrl}/upload`, formData)
    //   .pipe(map(response => response.documentId));
    
    // For now, we'll simulate the upload with a delay
    return new Observable(observer => {
      setTimeout(() => {
        // Generate a random document ID
        const documentId = 'doc' + Math.floor(Math.random() * 10000);
        observer.next(documentId);
        observer.complete();
      }, 1500);
    });
  }
} 