import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  publishDate: Date;
  author: string;
  category: string;
  isImportant: boolean;
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
  categories: string[] = ['Tất cả', 'Thông báo', 'Sự kiện', 'Chính sách', 'Tin nội bộ'];
  selectedCategory = 'Tất cả';
  searchTerm = '';
  
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  ngAfterViewInit(): void {
    // Force chart update after view is initialized
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  loadNews(): void {
    // Mock data - replace with actual API call
    this.newsItems = [
      {
        id: 1,
        title: 'Thông báo về việc tổ chức họp nhân viên tháng 6/2023',
        summary: 'Công ty sẽ tổ chức cuộc họp nhân viên định kỳ vào ngày 15/06/2023 tại hội trường chính.',
        content: `
          <h2>Thông báo về việc tổ chức họp nhân viên tháng 6/2023</h2>
          <p>Kính gửi toàn thể nhân viên,</p>
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
        imageUrl: 'assets/images/news/meeting.jpg',
        publishDate: new Date('2023-06-10'),
        author: 'Ban Giám đốc',
        category: 'Thông báo',
        isImportant: true
      },
      {
        id: 2,
        title: 'Chính sách mới về làm việc từ xa',
        summary: 'Công ty triển khai chính sách mới về làm việc từ xa, cho phép nhân viên làm việc tại nhà tối đa 3 ngày/tuần.',
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
        imageUrl: 'assets/images/news/remote-work.jpg',
        publishDate: new Date('2023-06-05'),
        author: 'Phòng Nhân sự',
        category: 'Chính sách',
        isImportant: true
      },
      {
        id: 3,
        title: 'Sự kiện teambuilding tháng 7/2023',
        summary: 'Công ty sẽ tổ chức sự kiện teambuilding vào cuối tháng 7/2023 tại resort ven biển.',
        content: `
          <h2>Sự kiện teambuilding tháng 7/2023</h2>
          <p>Kính gửi toàn thể nhân viên,</p>
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
        imageUrl: 'assets/images/news/teambuilding.jpg',
        publishDate: new Date('2023-06-15'),
        author: 'Phòng Nhân sự',
        category: 'Sự kiện',
        isImportant: false
      },
      {
        id: 4,
        title: 'Tin tức về dự án mới của công ty',
        summary: 'Công ty đã ký kết hợp đồng với đối tác lớn về dự án phát triển phần mềm quản lý doanh nghiệp.',
        content: `
          <h2>Tin tức về dự án mới của công ty</h2>
          <p>Chúng tôi rất vui mừng thông báo rằng công ty đã ký kết hợp đồng với đối tác lớn về dự án phát triển phần mềm quản lý doanh nghiệp. Dự án này sẽ kéo dài trong 12 tháng và huy động sự tham gia của nhiều nhân viên từ các phòng ban khác nhau.</p>
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
        imageUrl: 'assets/images/news/project.jpg',
        publishDate: new Date('2023-06-20'),
        author: 'Ban Giám đốc',
        category: 'Tin nội bộ',
        isImportant: false
      },
      {
        id: 5,
        title: 'Thông báo về việc nâng cấp hệ thống máy chủ',
        summary: 'Công ty sẽ tiến hành nâng cấp hệ thống máy chủ vào cuối tuần này, có thể gây gián đoạn dịch vụ.',
        content: `
          <h2>Thông báo về việc nâng cấp hệ thống máy chủ</h2>
          <p>Kính gửi toàn thể nhân viên,</p>
          <p>Phòng CNTT sẽ tiến hành nâng cấp hệ thống máy chủ vào cuối tuần này. Việc nâng cấp này nhằm cải thiện hiệu suất và bảo mật của hệ thống.</p>
          <h3>Thời gian thực hiện:</h3>
          <p>- Bắt đầu: 20:00, thứ Bảy, ngày 17/06/2023</p>
          <p>- Kết thúc dự kiến: 08:00, Chủ nhật, ngày 18/06/2023</p>
          <h3>Ảnh hưởng:</h3>
          <p>- Hệ thống email nội bộ có thể gián đoạn</p>
          <p>- Một số ứng dụng nội bộ có thể không hoạt động</p>
          <p>- Dữ liệu sẽ được sao lưu trước khi nâng cấp</p>
          <h3>Lưu ý:</h3>
          <p>- Nhân viên nên lưu công việc và đóng tất cả các ứng dụng trước khi rời văn phòng vào thứ Sáu</p>
          <p>- Nếu có vấn đề khẩn cấp, vui lòng liên hệ số điện thoại hỗ trợ: 0123.456.789</p>
          <p>Trân trọng,</p>
          <p>Phòng CNTT</p>
        `,
        imageUrl: 'assets/images/news/server.jpg',
        publishDate: new Date('2023-06-12'),
        author: 'Phòng CNTT',
        category: 'Thông báo',
        isImportant: false
      },
      {
        id: 6,
        title: 'Chính sách mới về đào tạo nhân viên',
        summary: 'Công ty triển khai chính sách mới về đào tạo nhân viên, tăng ngân sách đào tạo lên 50% so với năm trước.',
        content: `
          <h2>Chính sách mới về đào tạo nhân viên</h2>
          <p>Kính gửi toàn thể nhân viên,</p>
          <p>Nhằm nâng cao chất lượng nguồn nhân lực, công ty triển khai chính sách mới về đào tạo nhân viên, cụ thể như sau:</p>
          <h3>1. Tăng ngân sách đào tạo</h3>
          <p>- Ngân sách đào tạo tăng 50% so với năm trước</p>
          <p>- Mỗi nhân viên được cấp ngân sách đào tạo riêng</p>
          <p>- Hỗ trợ chi phí tham gia các khóa học bên ngoài</p>
          <h3>2. Chương trình đào tạo nội bộ</h3>
          <p>- Tổ chức các buổi workshop hàng tháng</p>
          <p>- Mời chuyên gia bên ngoài về đào tạo</p>
          <p>- Xây dựng thư viện học liệu trực tuyến</p>
          <h3>3. Chính sách khuyến khích</h3>
          <p>- Tặng thưởng cho nhân viên hoàn thành khóa học</p>
          <p>- Ưu tiên thăng tiến cho nhân viên tích cực học tập</p>
          <p>- Cấp chứng chỉ nội bộ cho các khóa đào tạo</p>
          <p>Chính sách này sẽ có hiệu lực từ ngày 01/07/2023.</p>
          <p>Trân trọng,</p>
          <p>Phòng Nhân sự</p>
        `,
        imageUrl: 'assets/images/news/training.jpg',
        publishDate: new Date('2023-06-18'),
        author: 'Phòng Nhân sự',
        category: 'Chính sách',
        isImportant: false
      }
    ];
    
    // Initialize filtered news items
    this.updateFilteredNews();
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
        news.summary.toLowerCase().includes(term) ||
        news.author.toLowerCase().includes(term)
      );
    }
    
    this.filteredNewsItems = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Reset to first page when filtering
    this.currentPage = 1;
    
    // Update paginated news
    this.updatePaginatedNews();
  }

  updatePaginatedNews(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedNews = this.filteredNewsItems.slice(startIndex, endIndex);
  }

  getImportantNews(): NewsItem[] {
    return this.filteredNewsItems.filter(news => news.isImportant);
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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