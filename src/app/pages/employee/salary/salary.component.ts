import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit, AfterViewInit {
  salaryHistory: any[] = [];
  salaryDetails: any = {
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    netSalary: 0,
    effectiveDate: new Date(),
    status: 'Active'
  };

  // Chart data
  salaryChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      {
        data: [],
        label: 'Lương cơ bản',
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)'
      },
      {
        data: [],
        label: 'Lương thực lãnh',
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)'
      }
    ],
    labels: []
  };

  allowanceChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(85, 110, 230, 0.8)',
          'rgba(52, 195, 143, 0.8)',
          'rgba(250, 92, 124, 0.8)',
          'rgba(251, 188, 5, 0.8)',
          'rgba(116, 97, 239, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  deductionChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Số tiền khấu trừ',
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  bonusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  allowanceTypes = [
    { name: 'Phụ cấp chức vụ', value: 500000, isPercentage: false, percentage: 0 },
    { name: 'Phụ cấp thâm niên', value: 300000, isPercentage: false, percentage: 0 },
    { name: 'Phụ cấp ăn trưa', value: 100000, isPercentage: false, percentage: 0 },
    { name: 'Phụ cấp đi lại', value: 200000, isPercentage: false, percentage: 0 },
    { name: 'Phụ cấp khác', value: 100000, isPercentage: false, percentage: 0 }
  ];

  deductionTypes = [
    { name: 'Bảo hiểm xã hội', value: 250000, isPercentage: true, percentage: 8 },
    { name: 'Bảo hiểm y tế', value: 100000, isPercentage: true, percentage: 1.5 },
    { name: 'Bảo hiểm thất nghiệp', value: 50000, isPercentage: true, percentage: 1 },
    { name: 'Thuế thu nhập', value: 75000, isPercentage: true, percentage: 5 },
    { name: 'Các khoản khác', value: 25000, isPercentage: false, percentage: 0 }
  ];

  bonusTypes = [
    { name: 'Thưởng tháng 13', value: 5000000, isPercentage: false, percentage: 0 },
    { name: 'Thưởng hiệu suất', value: 2000000, isPercentage: false, percentage: 0 },
    { name: 'Thưởng dự án', value: 3000000, isPercentage: false, percentage: 0 },
    { name: 'Thưởng đột xuất', value: 1000000, isPercentage: false, percentage: 0 },
    { name: 'Thưởng khác', value: 500000, isPercentage: false, percentage: 0 }
  ];

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + ' VNĐ';
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' VNĐ';
          }
        }
      }
    }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + ' VNĐ';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Số tiền: ' + context.parsed.y.toLocaleString() + ' VNĐ';
          }
        }
      }
    }
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Thêm biến cho chức năng lọc theo tháng năm
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  availableMonths = [
    { value: 0, label: 'Tháng 1' },
    { value: 1, label: 'Tháng 2' },
    { value: 2, label: 'Tháng 3' },
    { value: 3, label: 'Tháng 4' },
    { value: 4, label: 'Tháng 5' },
    { value: 5, label: 'Tháng 6' },
    { value: 6, label: 'Tháng 7' },
    { value: 7, label: 'Tháng 8' },
    { value: 8, label: 'Tháng 9' },
    { value: 9, label: 'Tháng 10' },
    { value: 10, label: 'Tháng 11' },
    { value: 11, label: 'Tháng 12' }
  ];
  availableYears: number[] = [];

  // Thêm biến cho bộ lọc thời gian
  startMonth: number = 0;
  startYear: number = 0;
  endMonth: number = new Date().getMonth();
  endYear: number = new Date().getFullYear();
  filteredSalaryHistory: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadSalaryHistory();
    this.loadSalaryDetails();
    this.prepareChartData();
    this.initializeYearOptions();
    this.initializeDateRange();
    this.filterSalaryHistory();
  }

  ngAfterViewInit(): void {
    // Force chart update after view is initialized
    setTimeout(() => {
      this.allowanceChartData = { ...this.allowanceChartData };
      this.bonusChartData = { ...this.bonusChartData };
      this.deductionChartData = { ...this.deductionChartData };
      this.salaryChartData = { ...this.salaryChartData };
      this.cdr.detectChanges();
    }, 100);
  }

  // Khởi tạo danh sách năm (từ năm hiện tại trở về 3 năm trước)
  initializeYearOptions(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 4; i++) {
      this.availableYears.push(currentYear - i);
    }
    this.availableYears.sort((a, b) => b - a); // Sắp xếp giảm dần
  }

  // Xử lý khi người dùng thay đổi tháng hoặc năm
  onMonthChange(): void {
    // Tìm dữ liệu lương tương ứng với tháng và năm đã chọn
    const selectedSalary = this.salaryHistory.find(salary => {
      const salaryDate = new Date(salary.paymentDate);
      return salaryDate.getMonth() === this.selectedMonth && 
             salaryDate.getFullYear() === this.selectedYear;
    });

    if (selectedSalary) {
      // Cập nhật dữ liệu phụ cấp
      this.updateAllowanceData(selectedSalary);
      
      // Cập nhật dữ liệu khấu trừ
      this.updateDeductionData(selectedSalary);
      
      // Cập nhật dữ liệu thưởng
      this.updateBonusData(selectedSalary);
      
      // Cập nhật biểu đồ
      this.updateCharts();
    } else {
      // Nếu không tìm thấy dữ liệu, hiển thị dữ liệu mặc định
      this.resetToDefaultData();
    }
  }

  // Cập nhật dữ liệu phụ cấp
  updateAllowanceData(salary: any): void {
    // Trong thực tế, đây sẽ là dữ liệu từ API
    // Ở đây chúng ta chỉ cập nhật tổng phụ cấp
    this.salaryDetails.allowances = salary.allowances;
    
    // Cập nhật dữ liệu cho biểu đồ
    this.allowanceChartData.labels = this.allowanceTypes.map(item => item.name);
    this.allowanceChartData.datasets[0].data = this.allowanceTypes.map(item => item.value);
  }

  // Cập nhật dữ liệu khấu trừ
  updateDeductionData(salary: any): void {
    // Trong thực tế, đây sẽ là dữ liệu từ API
    // Ở đây chúng ta chỉ cập nhật tổng khấu trừ
    this.salaryDetails.deductions = salary.deductions;
    
    // Cập nhật dữ liệu cho biểu đồ
    this.deductionChartData.labels = this.deductionTypes.map(item => item.name);
    this.deductionChartData.datasets[0].data = this.deductionTypes.map(item => item.value);
  }

  // Cập nhật dữ liệu thưởng
  updateBonusData(salary: any): void {
    // Trong thực tế, đây sẽ là dữ liệu từ API
    // Ở đây chúng ta giữ nguyên dữ liệu mẫu
    
    // Cập nhật dữ liệu cho biểu đồ
    this.bonusChartData.labels = this.bonusTypes.map(item => item.name);
    this.bonusChartData.datasets[0].data = this.bonusTypes.map(item => item.value);
  }

  // Cập nhật tất cả biểu đồ
  updateCharts(): void {
    this.allowanceChartData = { ...this.allowanceChartData };
    this.bonusChartData = { ...this.bonusChartData };
    this.deductionChartData = { ...this.deductionChartData };
    this.cdr.detectChanges();
  }

  // Đặt lại dữ liệu mặc định
  resetToDefaultData(): void {
    // Trong thực tế, đây sẽ là dữ liệu từ API
    this.loadSalaryDetails();
    this.prepareChartData();
    this.updateCharts();
  }

  loadSalaryHistory() {
    // Mock data - replace with actual API call
    this.salaryHistory = [
      {
        month: 'March 2024',
        paymentDate: new Date(2024, 2, 15), // March 15, 2024
        basicSalary: 5000000,
        allowances: 1000000,
        deductions: 500000,
        netSalary: 5500000,
        status: 'Paid'
      },
      {
        month: 'February 2024',
        paymentDate: new Date(2024, 1, 15), // February 15, 2024
        basicSalary: 5000000,
        allowances: 1000000,
        deductions: 500000,
        netSalary: 5500000,
        status: 'Paid'
      },
      {
        month: 'January 2024',
        paymentDate: new Date(2024, 0, 15), // January 15, 2024
        basicSalary: 4500000,
        allowances: 800000,
        deductions: 400000,
        netSalary: 4900000,
        status: 'Paid'
      },
      {
        month: 'December 2023',
        paymentDate: new Date(2023, 11, 15), // December 15, 2023
        basicSalary: 4500000,
        allowances: 800000,
        deductions: 400000,
        netSalary: 4900000,
        status: 'Paid'
      },
      {
        month: 'November 2023',
        paymentDate: new Date(2023, 10, 15), // November 15, 2023
        basicSalary: 4000000,
        allowances: 600000,
        deductions: 300000,
        netSalary: 4300000,
        status: 'Paid'
      },
      {
        month: 'October 2023',
        paymentDate: new Date(2023, 9, 15), // October 15, 2023
        basicSalary: 4000000,
        allowances: 600000,
        deductions: 300000,
        netSalary: 4300000,
        status: 'Paid'
      }
    ];
  }

  loadSalaryDetails() {
    // Mock data - replace with actual API call
    this.salaryDetails = {
      basicSalary: 5000000,
      allowances: 1000000,
      deductions: 500000,
      netSalary: 5500000,
      effectiveDate: new Date(),
      status: 'Active'
    };
  }

  prepareChartData() {
    // Prepare data for salary history chart
    this.salaryChartData.labels = this.salaryHistory.map(item => item.month).reverse();
    this.salaryChartData.datasets[0].data = this.salaryHistory.map(item => item.basicSalary).reverse();
    this.salaryChartData.datasets[1].data = this.salaryHistory.map(item => item.netSalary).reverse();

    // Prepare data for allowance chart
    this.allowanceChartData.labels = this.allowanceTypes.map(item => item.name);
    this.allowanceChartData.datasets[0].data = this.allowanceTypes.map(item => item.value);

    // Prepare data for deduction chart
    this.deductionChartData.labels = this.deductionTypes.map(item => item.name);
    this.deductionChartData.datasets[0].data = this.deductionTypes.map(item => item.value);

    // Prepare data for bonus chart
    this.bonusChartData.labels = this.bonusTypes.map(item => item.name);
    this.bonusChartData.datasets[0].data = this.bonusTypes.map(item => item.value);
  }

  calculateNetSalary() {
    return this.salaryDetails.basicSalary + this.salaryDetails.allowances - this.salaryDetails.deductions;
  }

  calculateTotalBonus() {
    return this.bonusTypes.reduce((sum, bonus) => sum + bonus.value, 0);
  }

  // Thêm phương thức khởi tạo khoảng thời gian
  initializeDateRange(): void {
    if (this.salaryHistory && this.salaryHistory.length > 0) {
      // Sắp xếp lịch sử lương theo ngày
      const sortedHistory = [...this.salaryHistory].sort((a, b) => {
        return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      });
      
      // Lấy tháng và năm đầu tiên có dữ liệu
      const firstDate = new Date(sortedHistory[0].paymentDate);
      this.startMonth = firstDate.getMonth();
      this.startYear = firstDate.getFullYear();
      
      // Mặc định kết thúc là tháng/năm hiện tại
      this.endMonth = new Date().getMonth();
      this.endYear = new Date().getFullYear();
    }
  }

  // Thêm phương thức lọc lịch sử lương
  filterSalaryHistory(): void {
    this.filteredSalaryHistory = this.salaryHistory.filter(salary => {
      const salaryDate = new Date(salary.paymentDate);
      const startDate = new Date(this.startYear, this.startMonth, 1);
      const endDate = new Date(this.endYear, this.endMonth + 1, 0); // Ngày cuối cùng của tháng

      return salaryDate >= startDate && salaryDate <= endDate;
    });

    // Cập nhật dữ liệu cho biểu đồ
    this.salaryChartData.labels = this.filteredSalaryHistory.map(item => item.month).reverse();
    this.salaryChartData.datasets[0].data = this.filteredSalaryHistory.map(item => item.basicSalary).reverse();
    this.salaryChartData.datasets[1].data = this.filteredSalaryHistory.map(item => item.netSalary).reverse();
  }

  // Thêm phương thức xử lý khi thay đổi bộ lọc
  onFilterChange(): void {
    this.filterSalaryHistory();
  }
} 