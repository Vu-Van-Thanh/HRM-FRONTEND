import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { ChartType } from './dashboard.model';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { EventService } from '../../../core/services/event.service';

import { ConfigService } from '../../../core/services/config.service';

// Calendar day interface
interface CalendarDay {
  date: number | null;
  isCurrentMonth: boolean;
  status?: string; // 'success', 'danger', 'warning', 'info', etc.
}

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  modalRef?: BsModalRef;
  isVisible: string;

  emailSentBarChart: ChartType;
  monthlyEarningChart: ChartType;
  transactions: any;
  statData: any;
  config:any = {
    backdrop: true,
    ignoreBackdropClick: true
  };

  isActive: string;

  // Calendar properties
  selectedMonth: number = new Date().getMonth() + 1; // Current month (1-12)
  selectedYear: number = new Date().getFullYear(); // Current year
  calendarWeeks: CalendarDay[][] = [];
  
  // Chart properties
  workProgressChart: ChartType;
  attendanceHoursChart: ChartType;
  
  @ViewChild('content') content;
  @ViewChild('center', { static: false }) center?: ModalDirective;
  constructor(private modalService: BsModalService, private configService: ConfigService, private eventService: EventService) {
  }

  ngOnInit(): void {
    this.fetchData();
    this.updateCalendar();
    this.initWorkProgressChart();
    this.initAttendanceHoursChart();
  }

  ngAfterViewInit() {
    setTimeout(() => {
     this.center?.show()
    }, 2000);
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    this.emailSentBarChart = emailSentBarChart;
    this.monthlyEarningChart = monthlyEarningChart;

    this.isActive = 'year';
    this.configService.getConfig().subscribe(data => {
      this.transactions = data.transactions;
      this.statData = data.statData;
    });
  }
  
  /**
   * Updates the calendar based on selected month and year
   */
  updateCalendar() {
    this.calendarWeeks = [];
    
    // Get first day of the month and last day of the month
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const lastDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 0);
    
    // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayWeekday;
    
    // Get last day of previous month
    const lastDayOfPrevMonth = new Date(this.selectedYear, this.selectedMonth - 1, 0).getDate();
    
    // Current date counter
    let currentDate = 1;
    let nextMonthDate = 1;
    
    // Generate calendar grid (6 weeks maximum)
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      // Skip week if we've already processed all days in month and next month padding
      if (currentDate > lastDayOfMonth.getDate() && weekIndex > 0) {
        continue;
      }
      
      const week: CalendarDay[] = [];
      
      // Generate days for current week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        if (weekIndex === 0 && dayIndex < firstDayWeekday) {
          // Show days from previous month
          const prevMonthDate = lastDayOfPrevMonth - daysFromPrevMonth + dayIndex + 1;
          week.push({
            date: prevMonthDate,
            isCurrentMonth: false,
            status: this.getRandomStatus() // In real app, this would come from your data
          });
        } else if (currentDate <= lastDayOfMonth.getDate()) {
          // Show days from current month
          week.push({
            date: currentDate,
            isCurrentMonth: true,
            status: this.getRandomStatus() // In real app, this would come from your data
          });
          currentDate++;
        } else {
          // Show days from next month
          week.push({
            date: nextMonthDate,
            isCurrentMonth: false,
            status: this.getRandomStatus() // In real app, this would come from your data
          });
          nextMonthDate++;
        }
      }
      
      this.calendarWeeks.push(week);
      
      // Stop if we've added all days for the current month and at least some days from next month
      if (currentDate > lastDayOfMonth.getDate() && nextMonthDate > 1) {
        break;
      }
    }
  }
  
  /**
   * Returns the appropriate CSS class for a status
   * @param status The attendance status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'present':
        return 'bg-success';
      case 'absent':
        return 'bg-primary';
      case 'overtime':
        return 'bg-danger';
      case 'fullShift':
        return 'bg-warning';
      case 'late':
        return 'bg-danger';
      case 'holiday':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }
  
  /**
   * Helper method to generate random statuses for demo purposes
   * In a real app, this would be replaced with actual attendance data
   */
  private getRandomStatus(): string {
    const statuses = ['present', 'absent', 'overtime', 'fullShift', 'late', 'holiday'];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  }
  
  opencenterModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  weeklyreport() {
    this.isActive = 'week';
    this.emailSentBarChart.series =
      [{
        name: 'Series A',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Series B',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, {
        name: 'Series C',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }];
  }

  monthlyreport() {
    this.isActive = 'month';
    this.emailSentBarChart.series =
      [{
        name: 'Series A',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Series B',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Series C',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }];
  }

  yearlyreport() {
    this.isActive = 'year';
    this.emailSentBarChart.series =
      [{
        name: 'Series A',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Series B',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, {
        name: 'Series C',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }];
  }

  /**
   * Initialize work progress chart
   */
  private initWorkProgressChart() {
    this.workProgressChart = {
      chart: {
        height: 280,
        type: 'area',
        toolbar: {
          show: false,
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 3,
        curve: 'smooth'
      },
      colors: ['#5b73e8'],
      series: [{
        name: 'Completed Tasks',
        data: [22, 23, 30, 28, 32, 27, 24]
      }],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100]
        },
      },
      xaxis: {
        categories: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
      },
    };
  }

  /**
   * Initialize attendance hours chart
   */
  private initAttendanceHoursChart() {
    this.attendanceHoursChart = {
      chart: {
        height: 240,
        type: 'donut',
      }, 
      plotOptions: {
        pie: {
          donut: {
            size: '75%'
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      series: [210, 16, 24, 4],
      labels: ['Làm việc', 'Ngày Nghỉ', 'Tăng ca', 'Đi trễ'],
      colors: ['#5b73e8', '#50a5f1', '#f46a6a', '#f1b44c'],
      legend: {
        show: false
      }
    };
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
