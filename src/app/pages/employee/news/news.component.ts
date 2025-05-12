import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { forkJoin } from 'rxjs';

interface Department {
  departmentId: string;
  departmentName: string;
  manager: string;
  description: string;
  location: string;
  contact: string;
}

interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  publishDate: Date;
  author?: string;
  category: string;
  isImportant: boolean;
  departmentId: string;
  departmentName?: string;
  type: 'INTERNAL' | 'INFO' | 'EVENT' | 'OUTSTANDING' | 'POLICY';
  dateCreated: Date;
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, AfterViewInit {
  newsItems: NewsItem[] = [];
  filteredNewsItems: NewsItem[] = [];
  selectedNews: NewsItem | null = null;
  showDetail = false;
  safeContent: SafeHtml | null = null;
  categories: string[] = ['Tất cả', 'Nội bộ', 'Thông tin', 'Sự kiện', 'Nổi bật', 'Chính sách'];
  selectedCategory = 'Tất cả';
  searchTerm = '';
  departments: Department[] = [];
  
  // Phân trang
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  totalPages = 0;
  paginatedNews: NewsItem[] = [];
  
  // Khai báo Math để sử dụng trong template
  Math = Math;

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Force chart update after view is initialized
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  loadData(): void {
    // Use forkJoin to fetch both departments and news in parallel
    forkJoin({
      departments: this.http.get<Department[]>(API_ENDPOINT.getAllDepartment),
      news: this.http.get<any[]>(API_ENDPOINT.getAllNews)
    }).subscribe({
      next: (result) => {
        this.departments = result.departments;
        this.processNewsData(result.news);
      },
      error: (error) => {
        console.error('❌ Error loading data:', error);
        // Load mock data if API fails
        this.loadMockData();
      }
    });
  }

/*  extractImageFromContent(content: string): string | null {
    // Look for image tags in the HTML content
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = content.match(imgRegex);
    return match ? match[2] : null;
  }*/
    extractImageFromContent(content: string): string | null {
      const imgRegex = /<img[^>]+src="([^">]+)"/gi;
      const matches = [...content.matchAll(imgRegex)];
      return matches.length >= 2 ? matches[1][1] : null;
    }
    

  processNewsData(newsData: any[]): void {
    this.newsItems = newsData.map(item => {
      // Map the news type to a category name in Vietnamese
      let category = 'Thông tin';
      let isImportant = false;
      
      switch(item.type) {
        case 'INTERNAL':
          category = 'Nội bộ';
          break;
        case 'INFO':
          category = 'Thông tin';
          break;
        case 'EVENT':
          category = 'Sự kiện';
          break;
        case 'OUTSTANDING':
          category = 'Nổi bật';
          isImportant = true;
          break;
        case 'POLICY':
          category = 'Chính sách';
          break;
      }
      
      // Extract image from content if available
      const extractedImage = this.extractImageFromContent(item.content || '');
      
      // Find department name
      const department = this.departments.find(d => d.departmentId === item.departmentId);
      const departmentName = department ? department.departmentName : item.departmentId;
      
      return {
        id: item.id || 0,
        title: item.title || '',
        content: item.content || '',
        summary: item.title, // Using title as summary if no summary provided
        imageUrl: extractedImage || 'assets/images/news/news_default.jpg', // Use extracted image or default
        publishDate: new Date(item.dateCreated),
        dateCreated: new Date(item.dateCreated),
        author: departmentName || 'Không xác định',
        category: category,
        isImportant: isImportant,
        departmentId: item.departmentId || '',
        departmentName: departmentName,
        type: item.type
      };
    });
    
    // Sort by date descending (newest first)
    this.newsItems.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    
    console.log('✅ Loaded news items:', this.newsItems);
    this.updateFilteredNews();
  }

  loadMockData(): void {
    // Mock departments
    this.departments = [
      {
        departmentId: "FN",
        departmentName: "Finance",
        manager: "Robert Brown",
        description: "Manages company finances and budget planning.",
        location: "Chicago",
        contact: "+1-555-9876"
      },
      {
        departmentId: "HR",
        departmentName: "Human Resources",
        manager: "John Doe",
        description: "Responsible for employee relations and HR policies.",
        location: "New York",
        contact: "+1-555-1234"
      },
      {
        departmentId: "IT",
        departmentName: "Information Technology",
        manager: "Jane Smith",
        description: "Manages technology infrastructure and software development.",
        location: "San Francisco",
        contact: "+1-555-5678"
      }
    ];
    
    // Mock news data - then call processNewsData
    const mockNewsData = [
      {
        id: 1,
        title: 'Thông báo về việc tổ chức họp nhân viên tháng 6/2023',
        content: `
          <h2>Thông báo về việc tổ chức họp nhân viên tháng 6/2023</h2>
          <p>Kính gửi toàn thể nhân viên,</p>
          <img src="assets/images/news/meeting.jpg" alt="Meeting image" />
          <p>Công ty sẽ tổ chức cuộc họp nhân viên định kỳ vào ngày 15/06/2023 tại hội trường chính. Cuộc họp này sẽ tập trung vào các vấn đề sau:</p>
          <ul>
            <li>Báo cáo kết quả kinh doanh quý 2/2023</li>
            <li>Thảo luận về chiến lược phát triển trong quý 3/2023</li>
            <li>Giải đáp thắc mắc của nhân viên</li>
          </ul>
          <p>Thời gian: 14:00 - 16:00, ngày 15/06/2023</p>
          <p>Địa điểm: Hội trường chính, tầng 10, tòa nhà A</p>
          <p>Yêu cầu tất cả nhân viên có mặt đúng giờ và chuẩn bị các câu hỏi nếu có.</p>
          <p>Trân trọng,</p>
          <p>Ban Giám đốc</p>
        `,
        dateCreated: '2023-06-10T10:00:00',
        departmentId: 'HR',
        type: 'INTERNAL'
      },
      {
        id: 2,
        title: 'Chính sách mới về làm việc từ xa',
        content: `
          <h2>Chính sách mới về làm việc từ xa</h2>
          <p>Kính gửi toàn thể nhân viên,</p>
          <p>Nhằm nâng cao hiệu suất làm việc và cân bằng cuộc sống cho nhân viên, công ty triển khai chính sách mới về làm việc từ xa, cụ thể như sau:</p>
          <h3>1. Quy định chung</h3>
          <p>- Nhân viên được phép làm việc từ xa tối đa 3 ngày/tuần</p>
          <p>- Cần đăng ký lịch làm việc từ xa trước ít nhất 1 tuần</p>
          <p>- Phải tham gia đầy đủ các cuộc họp trực tuyến theo lịch</p>
          <h3>2. Điều kiện áp dụng</h3>
          <p>- Nhân viên đã hoàn thành thời gian thử việc</p>
          <p>- Có hiệu suất làm việc tốt trong 3 tháng gần nhất</p>
          <p>- Có môi trường làm việc phù hợp tại nhà</p>
          <h3>3. Quy trình đăng ký</h3>
          <p>- Gửi email đăng ký cho quản lý trực tiếp</p>
          <p>- Quản lý phê duyệt và cập nhật lịch làm việc</p>
          <p>- Nhân viên báo cáo kết quả công việc hàng ngày</p>
          <p>Chính sách này sẽ có hiệu lực từ ngày 01/07/2023.</p>
          <p>Trân trọng,</p>
          <p>Phòng Nhân sự</p>
        `,
        dateCreated: '2023-06-05T14:30:00',
        departmentId: 'HR',
        type: 'POLICY'
      },
      {
        id: 3,
        title: 'Sự kiện teambuilding tháng 7/2023',
        content: `
          <h2>Sự kiện teambuilding tháng 7/2023</h2>
          <p>Kính gửi toàn thể nhân viên,</p>
          <img src="assets/images/news/teambuilding.jpg" alt="Teambuilding event" />
          <p>Công ty sẽ tổ chức sự kiện teambuilding vào cuối tháng 7/2023 tại resort ven biển. Đây là dịp để nhân viên giao lưu, thư giãn và tăng cường tinh thần đoàn kết.</p>
          <h3>Thông tin chi tiết:</h3>
          <p>- Thời gian: 28/07/2023 - 30/07/2023</p>
          <p>- Địa điểm: Resort ABC, thành phố XYZ</p>
          <p>- Chương trình: Hoạt động nhóm, trò chơi, gala dinner, tham quan</p>
          <p>- Chi phí: Công ty tài trợ 100%</p>
          <h3>Lưu ý:</h3>
          <p>- Nhân viên cần đăng ký tham gia trước ngày 15/07/2023</p>
          <p>- Mang theo giấy tờ tùy thân và đồ dùng cá nhân</p>
          <p>- Tuân thủ nội quy của resort</p>
          <p>Trân trọng,</p>
          <p>Phòng Nhân sự</p>
        `,
        dateCreated: '2023-06-15T09:15:00',
        departmentId: 'HR',
        type: 'EVENT'
      },
      {
        id: 4,
        title: 'Tin tức về dự án mới của công ty',
        content: `
          <h2>Tin tức về dự án mới của công ty</h2>
          <p>Chúng tôi rất vui mừng thông báo rằng công ty đã ký kết hợp đồng với đối tác lớn về dự án phát triển phần mềm quản lý doanh nghiệp. Dự án này sẽ kéo dài trong 12 tháng và huy động sự tham gia của nhiều nhân viên từ các phòng ban khác nhau.</p>
          <img src="assets/images/news/project.jpg" alt="Project announcement" />
          <h3>Thông tin về dự án:</h3>
          <p>- Tên dự án: Hệ thống quản lý doanh nghiệp toàn diện</p>
          <p>- Đối tác: Công ty ABC</p>
          <p>- Thời gian thực hiện: 12 tháng</p>
          <p>- Ngân sách: 5 tỷ đồng</p>
          <h3>Vai trò của các phòng ban:</h3>
          <p>- Phòng Phát triển: Phát triển phần mềm</p>
          <p>- Phòng Thiết kế: Thiết kế giao diện</p>
          <p>- Phòng QA: Kiểm thử chất lượng</p>
          <p>- Phòng Dự án: Quản lý dự án</p>
          <p>Dự án này sẽ mở ra nhiều cơ hội phát triển cho nhân viên và tăng doanh thu cho công ty.</p>
          <p>Trân trọng,</p>
          <p>Ban Giám đốc</p>
        `,
        dateCreated: '2023-06-20T11:45:00',
        departmentId: 'IT',
        type: 'INFO'
      }
    ];
    
    this.processNewsData(mockNewsData);
  }

  updateFilteredNews(): void {
    let filtered = [...this.newsItems];
    
    // Filter by category
    if (this.selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(news => news.category === this.selectedCategory);
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(term) || 
        (news.summary && news.summary.toLowerCase().includes(term)) ||
        (news.departmentName && news.departmentName.toLowerCase().includes(term))
      );
    }
    
    this.filteredNewsItems = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.updatePaginatedNews();
  }

  updatePaginatedNews(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedNews = this.filteredNewsItems.slice(startIndex, endIndex);
  }

  getImportantNews(): NewsItem[] {
    return this.filteredNewsItems.filter(news => news.isImportant).slice(0, 2);
  }

  getLatestNews(): NewsItem[] {
    // Return the most recent news items (already sorted by date in processNewsData)
    return this.filteredNewsItems.slice(0, 3);
  }

  getNonImportantNews(): NewsItem[] {
    return this.filteredNewsItems.filter(news => !news.isImportant);
  }

  viewNewsDetail(news: NewsItem): void {
    this.selectedNews = news;
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(news.content);
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedNews = null;
    this.safeContent = null;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.updateFilteredNews();
  }

  onSearch(): void {
    this.updateFilteredNews();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) return ''; // Invalid date
    
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  // Phân trang
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedNews();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang nếu tổng số trang nhỏ hơn hoặc bằng maxVisiblePages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Hiển thị một phần các trang với dấu ...
      if (this.currentPage <= 3) {
        // Nếu trang hiện tại ở đầu
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Dấu ...
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        // Nếu trang hiện tại ở cuối
        pages.push(1);
        pages.push(-1); // Dấu ...
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Nếu trang hiện tại ở giữa
        pages.push(1);
        pages.push(-1); // Dấu ...
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Dấu ...
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }
} 