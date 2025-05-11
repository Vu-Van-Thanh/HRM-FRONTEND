import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { SalaryService } from 'src/app/services/salary.service';

interface SalaryInfo {
  employeeId: string;
  salaryBase: {
    salaryId: string;
    baseIndex: number;
    baseSalary: number;
    effectiveDate: string;
    createdAt: string | null;
  };
  adjustments: {
    adjustmentId: string;
    baseId: string;
    adjustType: string;
    adjustmentName: string;
    amount: number;
    percentage: number | null;
    resultPercentage: number | null;
    resultAmount: number;
    result: any;
  }[];
}

interface SalaryChange {
  histId: string;
  baseId: string;
  oldSalary: number;
  newSalary: number;
  oldSalaryCoefficient: number;
  newSalaryCoefficient: number;
  reason: string;
  createdAt: string;
  effectiveDate: string;
}

interface SalaryPayment {
  paymentId: string;
  baseId: string;
  baseSalary: number;
  bonusAmount: number;
  deductionAmount: number;
  adjustmentAmount: number;
  netSalary: number;
  amount: number;
  paymentDate: string;
  createdAt: string;
  status: string;
}

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit, AfterViewInit {
  // API data
  salaryInfo: SalaryInfo | null = null;
  salaryHistory: SalaryChange[] = [];
  salaryPayments: SalaryPayment[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Current employee
  employeeId: string = '';
  baseId: string = '';
  
  // Calculated data
  totalBonuses = 0;
  totalDeductions = 0;
  totalOtherAdjustments = 0;
  netSalary = 0;
  bonusPercentage = 0;
  deductionPercentage = 0;
  otherAdjustmentsPercentage = 0;
  
  // UI data
  bonusAdjustments: any[] = [];
  deductionAdjustments: any[] = [];
  otherAdjustments: any[] = [];

  // Chart data for salary payments
  salaryChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Lương cơ bản',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
      },
      {
        data: [],
        label: 'Thưởng & Phụ cấp',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
      },
      {
        data: [],
        label: 'Khấu trừ',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
      },
      {
        data: [],
        label: 'Lương thực lãnh',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(153, 102, 255, 1)'
      }
    ]
  };

  bonusChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Thưởng cố định',
        backgroundColor: 'rgba(52, 195, 143, 0.8)',
        borderColor: 'rgba(52, 195, 143, 1)',
        borderWidth: 1,
        stack: 'stack0'
      },
      {
        data: [],
        label: 'Thưởng theo %',
        backgroundColor: 'rgba(85, 110, 230, 0.8)',
        borderColor: 'rgba(85, 110, 230, 1)',
        borderWidth: 1,
        stack: 'stack0'
      }
    ]
  };

  deductionChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Khấu trừ cố định',
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        stack: 'stack0'
      },
      {
        data: [],
        label: 'Khấu trừ theo %',
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        stack: 'stack0'
      }
    ]
  };

  otherAdjustmentsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Điều chỉnh cố định',
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        stack: 'stack0'
      },
      {
        data: [],
        label: 'Điều chỉnh theo %',
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        stack: 'stack0'
      }
    ]
  };

  salaryHistoryChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Lương cũ',
        borderColor: 'rgba(75, 192, 192, 0.8)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)'
      },
      {
        data: [],
        label: 'Lương mới',
        borderColor: 'rgba(54, 162, 235, 0.8)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)'
      }
    ]
  };

  // Chart options
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)',
          callback: function(value) {
            if (Number(value) >= 1000000) {
              return (Number(value) / 1000000).toFixed(1) + 'M VNĐ';
            } else if (Number(value) >= 1000) {
              return (Number(value) / 1000).toFixed(0) + 'K VNĐ';
            }
            return value + ' VNĐ';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 5,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + Number(context.parsed.y).toLocaleString() + ' VNĐ';
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    animation: {
      duration: 1000
    }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        display: true
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed.toLocaleString() + ' VNĐ';
            return label + ': ' + value;
          }
        }
      }
    }
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        position: 'bottom',
        display: true,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 5,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed.toLocaleString() + ' VNĐ';
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1) + '%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000
    },
    elements: {
      arc: {
        borderWidth: 2
      }
    }
  };

  polarAreaChartOptions: ChartOptions<'polarArea'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    scales: {
      r: {
        ticks: {
          backdropColor: 'rgba(255, 255, 255, 0.8)',
          color: 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 10
          },
          z: 1,
          callback: function(value) {
            const numValue = Number(value);
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + 'M';
            } else if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'K';
            }
            return value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        pointLabels: {
          font: {
            size: 11
          },
          color: 'rgba(0, 0, 0, 0.7)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        display: true,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 5,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = Number(context.raw).toLocaleString() + ' VNĐ';
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((Number(context.raw) / total) * 100).toFixed(1) + '%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000
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
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' VNĐ';
          }
        }
      }
    }
  };

  stackedBarChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
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
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' VNĐ';
          }
        }
      }
    }
  };

  radarChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        suggestedMin: 0,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          circular: true
        },
        pointLabels: {
          font: {
            size: 11
          },
          color: 'rgba(0, 0, 0, 0.7)'
        },
        ticks: {
          backdropColor: 'rgba(255, 255, 255, 0.8)',
          color: 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 10
          },
          callback: function(value: any) {
            const numValue = Number(value);
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + 'M';
            } else if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'K';
            }
            return value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 5,
        callbacks: {
          label: function(context) {
            const numValue = Number(context.raw);
            return context.dataset.label + ': ' + numValue.toLocaleString() + ' VNĐ';
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6
      }
    },
    animation: {
      duration: 1000
    }
  };

  stackedDeductionChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)',
          callback: function(value) {
            const numValue = Number(value);
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + 'M';
            } else if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'K';
            }
            return value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 5,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = Number(context.parsed.y).toLocaleString() + ' VNĐ';
            return `${label}: ${value}`;
          },
          afterBody: function(context) {
            const total = context[0].parsed._stacks.y[context[0].datasetIndex] + 
                         (context[1] ? context[1].parsed._stacks.y[context[1].datasetIndex] : 0);
            return [`Tổng: ${total.toLocaleString()} VNĐ`];
          }
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  stackedBonusChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)',
          callback: function(value) {
            const numValue = Number(value);
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + 'M';
            } else if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'K';
            }
            return value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 5,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = Number(context.parsed.y).toLocaleString() + ' VNĐ';
            return `${label}: ${value}`;
          },
          afterBody: function(context) {
            const total = context[0].parsed._stacks.y[context[0].datasetIndex] + 
                         (context[1] ? context[1].parsed._stacks.y[context[1].datasetIndex] : 0);
            return [`Tổng: ${total.toLocaleString()} VNĐ`];
          }
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  paymentChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 10
          },
          color: 'rgba(0, 0, 0, 0.7)',
          callback: function(value) {
            if (Number(value) >= 1000000) {
              return (Number(value) / 1000000).toFixed(1) + 'M VNĐ';
            } else if (Number(value) >= 1000) {
              return (Number(value) / 1000).toFixed(0) + 'K VNĐ';
            }
            return value + ' VNĐ';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 5,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + Number(context.parsed.y).toLocaleString() + ' VNĐ';
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    animation: {
      duration: 1000
    }
  };

  constructor(
    private salaryService: SalaryService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Get current employee ID from localStorage
    try {
      const userProfileString = localStorage.getItem('currentUserProfile');
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        this.employeeId = userProfile.employeeID || '';
      }
    } catch (error) {
      console.error('Error parsing user profile from localStorage:', error);
    }
    
    if (this.employeeId) {
      this.loadSalaryInfo();
    } else {
      this.error = 'Không thể xác định nhân viên hiện tại';
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    // Force chart update after view is initialized
    setTimeout(() => {
      console.log('ngAfterViewInit - forcing chart update');
      this.updateBonusChart();
      this.updateDeductionChart();
      this.updateSalaryHistoryChart();
      this.updatePaymentsChart();
      this.updateCharts();
      this.cdr.detectChanges();
    }, 500); 
  }

  /**
   * Load salary information from API
   */
  loadSalaryInfo(): void {
    this.isLoading = true;
    
    this.salaryService.getPayrollInfo(this.employeeId).subscribe({
      next: (data) => {
        console.log('Salary info response:', data);
        
        // Check if data is an array and has at least one element
        if (Array.isArray(data) && data.length > 0) {
          // Get the first element of the array
          const salaryInfo = data[0];
          
          // Check if salaryInfo has the expected structure
          if (salaryInfo && salaryInfo.salaryBase) {
            this.salaryInfo = salaryInfo;
            this.baseId = salaryInfo.salaryBase.salaryId;
            
            // Process adjustments
            this.processAdjustments();
            
            // Load salary history and payments
            this.loadSalaryHistory();
            this.loadSalaryPayments();
          } else {
            console.error('Invalid salary info structure:', salaryInfo);
            this.error = 'Dữ liệu lương không đúng định dạng';
            this.isLoading = false;
          }
        } else {
          console.error('Invalid salary info response structure:', data);
          this.error = 'Không tìm thấy dữ liệu lương';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading salary info:', error);
        this.error = 'Không thể tải thông tin lương';
        this.isLoading = false;
      }
    });
  }

  /**
   * Load salary history from API
   */
  loadSalaryHistory(): void {
    if (!this.baseId) {
      this.isLoading = false;
      return;
    }
    
    this.salaryService.getSalaryHistory(this.baseId).subscribe({
      next: (data) => {
        console.log('Salary history response:', data);
        
        if (data && Array.isArray(data)) {
          this.salaryHistory = data;
          this.updateSalaryHistoryChart();
          this.updateCharts();
        } else {
          console.warn('Unexpected salary history format:', data);
          this.salaryHistory = [];
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading salary history:', error);
        this.error = 'Không thể tải lịch sử lương';
        this.isLoading = false;
      }
    });
  }

  /**
   * Load salary payments from API
   */
  loadSalaryPayments(): void {
    if (!this.baseId) {
      return;
    }
    
    this.salaryService.getSalaryPayments(this.baseId).subscribe({
      next: (data) => {
        console.log('Salary payments response:', data);
        
        if (data && Array.isArray(data)) {
          // Process payment data to ensure all required fields are available
          this.salaryPayments = data.map(payment => {
            // If the API doesn't provide these fields, calculate them based on available data
            const baseSalary = payment.baseSalary || (this.salaryInfo?.salaryBase?.baseSalary || 0);
            const bonusAmount = payment.bonusAmount || this.totalBonuses;
            const deductionAmount = payment.deductionAmount ;//|| this.totalDeductions;
            const adjustmentAmount = payment.adjustmentAmount || 0;
            
            return {
              ...payment,
              baseSalary,
              bonusAmount,
              deductionAmount,
              adjustmentAmount
            };
          });
          
          this.updatePaymentsChart();
          this.updateCharts();
        } else {
          console.warn('Unexpected salary payments format:', data);
          this.salaryPayments = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading salary payments:', error);
        this.error = 'Không thể tải lịch sử thanh toán lương';
        this.isLoading = false;
      }
    });
  }

  /**
   * Process salary adjustments into categories
   */
  processAdjustments(): void {
    if (!this.salaryInfo) {
      return;
    }
    
    // Reset arrays
    this.bonusAdjustments = [];
    this.deductionAdjustments = [];
    this.otherAdjustments = [];
    
    // Group adjustments by type if adjustments exist
    if (this.salaryInfo.adjustments && Array.isArray(this.salaryInfo.adjustments)) {
      console.log('Processing adjustments:', this.salaryInfo.adjustments);
      
      this.salaryInfo.adjustments.forEach(adjustment => {
        if (!adjustment.adjustType) {
          this.otherAdjustments.push(adjustment);
          return;
        }
        
        switch (adjustment.adjustType.toLowerCase()) {
          case 'bonus':
            this.bonusAdjustments.push(adjustment);
            break;
          case 'deduction':
            this.deductionAdjustments.push(adjustment);
            break;
          default:
            this.otherAdjustments.push(adjustment);
            break;
        }
      });
      
      console.log('Categorized adjustments:', {
        bonuses: this.bonusAdjustments,
        deductions: this.deductionAdjustments,
        others: this.otherAdjustments
      });
    } else {
      console.log('No adjustments found in salary info');
    }
    
    // Calculate totals
    this.calculateTotals();
    
    // Update charts
    this.updateBonusChart();
    this.updateDeductionChart();
    this.updateOtherAdjustmentsChart();
  }

  /**
   * Calculate total bonuses, deductions, and net salary
   */
  calculateTotals(): void {
    // Get base salary
    const baseSalary = this.salaryInfo?.salaryBase?.baseSalary || 0;
    
    // Calculate total bonuses
    this.totalBonuses = Array.isArray(this.bonusAdjustments) ? 
      this.bonusAdjustments.reduce((sum, item) => sum + (item.resultAmount || 0), 0) : 0;
    
    // Calculate total deductions
    this.totalDeductions = Array.isArray(this.deductionAdjustments) ? 
      this.deductionAdjustments.reduce((sum, item) => sum + (item.resultAmount || 0), 0) : 0;
      
    // Calculate total other adjustments
    this.totalOtherAdjustments = Array.isArray(this.otherAdjustments) ? 
      this.otherAdjustments.reduce((sum, item) => sum + (item.resultAmount || 0), 0) : 0;
    
    // Calculate percentages (if base salary is not zero)
    if (baseSalary > 0) {
      this.bonusPercentage = (Number(this.totalBonuses) / Number(baseSalary)) * 100;
      this.deductionPercentage = (Number(this.totalDeductions) / Number(baseSalary)) * 100;
      this.otherAdjustmentsPercentage = (Number(this.totalOtherAdjustments) / Number(baseSalary)) * 100;
    } else {
      this.bonusPercentage = 0;
      this.deductionPercentage = 0;
      this.otherAdjustmentsPercentage = 0;
    }
    
    // Calculate net salary
    if (this.salaryInfo && this.salaryInfo.salaryBase) {
      this.netSalary = baseSalary + this.totalBonuses - this.totalDeductions + this.totalOtherAdjustments;
    } else {
      this.netSalary = 0;
    }
  }

  /**
   * Update bonus chart data
   */
  updateBonusChart(): void {
    if (!Array.isArray(this.bonusAdjustments) || this.bonusAdjustments.length === 0) {
      console.log('No bonus adjustments to display in chart');
      return;
    }
    const baseSalary = this.salaryInfo?.salaryBase?.baseSalary || 0;
    console.log("Bonus data ZZZZZZZZZZZZ ", this.bonusAdjustments)  
    
    // Group bonuses by their adjustment name
    const bonusByName = this.bonusAdjustments.reduce((acc, bonus) => {
      const name = bonus.adjustmentName || 'Unknown';
      if (!acc[name]) {
        acc[name] = {
          fixed: 0,
          percentage: 0
        };
      }
      
      // A bonus can have both percentage and fixed amount components
      if (bonus.percentage) {
        acc[name].percentage += (bonus.percentage * baseSalary / 100 || 0);
      } 
      
      if (bonus.amount) {
        acc[name].fixed += (bonus.amount || 0);
      }
      
      return acc;
    }, {});
    
    // Extract unique bonus names as labels
    const bonusNames = Object.keys(bonusByName);
    
    // Extract fixed and percentage amounts
    const fixedBonuses = bonusNames.map(name => bonusByName[name].fixed);
    const percentageBonuses = bonusNames.map(name => bonusByName[name].percentage);
    
    // Update chart data
    this.bonusChartData.labels = bonusNames;
    this.bonusChartData.datasets[0].data = fixedBonuses;
    this.bonusChartData.datasets[1].data = percentageBonuses;
    
    console.log('Bonus chart data updated:', this.bonusChartData);
  }

  /**
   * Update deduction chart data
   */
  updateDeductionChart(): void {
    if (!Array.isArray(this.deductionAdjustments) || this.deductionAdjustments.length === 0) {
      console.log('No deduction adjustments to display in chart');
      return;
    }
    
    const baseSalary = this.salaryInfo?.salaryBase?.baseSalary || 0;
    console.log('Updating deduction chart with data:', this.deductionAdjustments);
    
    // Group deductions by their adjustment name
    const deductionByName = this.deductionAdjustments.reduce((acc, deduction) => {
      const name = deduction.adjustmentName || 'Unknown';
      if (!acc[name]) {
        acc[name] = {
          fixed: 0,
          percentage: 0
        };
      }
      
      // A deduction can have both percentage and fixed amount components
      if (deduction.percentage) {
        acc[name].percentage += (deduction.percentage * baseSalary / 100 || 0);
      } 
      
      if (deduction.amount) {
        acc[name].fixed += (deduction.amount || 0);
      }
      
      return acc;
    }, {});
    
    // Extract unique deduction names as labels
    const deductionNames = Object.keys(deductionByName);
    
    // Extract fixed and percentage amounts
    const fixedDeductions = deductionNames.map(name => deductionByName[name].fixed);
    const percentageDeductions = deductionNames.map(name => deductionByName[name].percentage);
    
    // Update chart data
    this.deductionChartData.labels = deductionNames;
    this.deductionChartData.datasets[0].data = fixedDeductions;
    this.deductionChartData.datasets[1].data = percentageDeductions;
    
    console.log('Deduction chart data updated:', this.deductionChartData);
  }

  /**
   * Update salary history chart
   */
  updateSalaryHistoryChart(): void {
    if (!Array.isArray(this.salaryHistory) || this.salaryHistory.length === 0) {
      console.log('No salary history to display in chart');
      return;
    }
    
    console.log('Updating salary history chart with data:', this.salaryHistory);
    
    // Sort history by effective date
    const sortedHistory = [...this.salaryHistory].sort((a, b) => {
      const dateA = a.effectiveDate ? new Date(a.effectiveDate).getTime() : 0;
      const dateB = b.effectiveDate ? new Date(b.effectiveDate).getTime() : 0;
      return dateA - dateB;
    });
    
    // Format dates for display
    this.salaryHistoryChartData.labels = sortedHistory.map(item => 
      this.formatDate(item.effectiveDate || '')
    );
    
    // Create datasets for old and new salary
    this.salaryHistoryChartData.datasets[0].data = sortedHistory.map(item => item.oldSalary || 0);
    this.salaryHistoryChartData.datasets[1].data = sortedHistory.map(item => item.newSalary || 0);
    
    console.log('Salary history chart data updated:', this.salaryHistoryChartData);
  }

  /**
   * Update payments chart
   */
  updatePaymentsChart(): void {
    if (!Array.isArray(this.salaryPayments) || this.salaryPayments.length === 0) {
      console.log('No salary payments to display in chart');
      return;
    }
    
    console.log('Updating payments chart with data:', this.salaryPayments);
    
    // Sort payments by date
    const sortedPayments = [...this.salaryPayments].sort((a, b) => {
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return dateA - dateB;
    });
     // Format dates for display
    this.salaryChartData.labels = sortedPayments.map(item => 
      this.formatDate(item.paymentDate || '')
    );
    
    // Create datasets for different salary components
    this.salaryChartData.datasets[0].data = sortedPayments.map(item => item.baseSalary || 0);
    this.salaryChartData.datasets[1].data = sortedPayments.map(item => item.bonusAmount || 0);
    this.salaryChartData.datasets[2].data = sortedPayments.map(item => item.deductionAmount || 0);
    this.salaryChartData.datasets[3].data = sortedPayments.map(item => item.netSalary || 0);
    
    console.log('Payments chart data updated:', this.salaryChartData);
  }

  /**
   * Update other adjustments chart data
   */
  updateOtherAdjustmentsChart(): void {
    if (!Array.isArray(this.otherAdjustments) || this.otherAdjustments.length === 0) {
      console.log('No other adjustments to display in chart');
      return;
    }
    
    const baseSalary = this.salaryInfo?.salaryBase?.baseSalary || 0;
    console.log('Updating other adjustments chart with data:', this.otherAdjustments);
    
    // Group other adjustments by their adjustment name
    const adjustmentByName = this.otherAdjustments.reduce((acc, adjustment) => {
      const name = adjustment.adjustmentName || 'Unknown';
      if (!acc[name]) {
        acc[name] = {
          fixed: 0,
          percentage: 0
        };
      }
      
      // An adjustment can have both percentage and fixed amount components
      if (adjustment.percentage) {
        acc[name].percentage += (adjustment.percentage * baseSalary / 100 || 0);
      } 
      
      if (adjustment.amount) {
        acc[name].fixed += (adjustment.amount || 0);
      }
      
      return acc;
    }, {});
    
    // Extract unique adjustment names as labels
    const adjustmentNames = Object.keys(adjustmentByName);
    
    // Extract fixed and percentage amounts
    const fixedAdjustments = adjustmentNames.map(name => adjustmentByName[name].fixed);
    const percentageAdjustments = adjustmentNames.map(name => adjustmentByName[name].percentage);
    
    // Update chart data
    this.otherAdjustmentsChartData.labels = adjustmentNames;
    this.otherAdjustmentsChartData.datasets[0].data = fixedAdjustments;
    this.otherAdjustmentsChartData.datasets[1].data = percentageAdjustments;
    
    console.log('Other adjustments chart data updated:', this.otherAdjustmentsChartData);
  }

  /**
   * Update all charts
   */
  updateCharts(): void {
    console.log('Updating all charts');
    this.bonusChartData = { ...this.bonusChartData };
    this.deductionChartData = { ...this.deductionChartData };
    this.otherAdjustmentsChartData = { ...this.otherAdjustmentsChartData };
    this.salaryChartData = { ...this.salaryChartData };
    this.salaryHistoryChartData = { ...this.salaryHistoryChartData };
    console.log('All charts updated');
  }

  /**
   * Format date string
   * @param dateString Date string
   * @returns Formatted date
   */
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('vi-VN', { 
        day: 'numeric', 
        month: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }

  /**
   * Get adjustment type badge class
   * @param type Adjustment type
   * @returns CSS class
   */
  getAdjustmentTypeClass(type: string | null | undefined): string {
    if (!type) return 'bg-info';
    
    switch(type.toLowerCase()) {
      case 'bonus':
        return 'bg-success';
      case 'deduction':
        return 'bg-danger';
      default:
        return 'bg-info';
    }
  }

  /**
   * Get payment status badge class
   * @param status Payment status
   * @returns CSS class
   */
  getPaymentStatusClass(status: string | null | undefined): string {
    if (!status) return 'bg-secondary';
    
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Calculate amount from percentage of base salary
   * @param percentage Percentage value
   * @returns Calculated amount
   */
  calculateAmountFromPercentage(percentage: number | null | undefined): number {
    if (!percentage || !this.salaryInfo || !this.salaryInfo.salaryBase) {
      return 0;
    }
    
    const baseSalary = this.salaryInfo.salaryBase.baseSalary || 0;
    return (baseSalary * percentage) / 100;
  }
} 