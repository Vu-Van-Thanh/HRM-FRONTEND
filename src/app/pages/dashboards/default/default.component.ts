import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { ChartType } from './dashboard.model';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { EventService } from '../../../core/services/event.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

import { ConfigService } from '../../../core/services/config.service';

// Calendar day interface
interface CalendarDay {
  date: number | null;
  isCurrentMonth: boolean;
  status?: string; 
  activities?: ActivityRequestDTO[]; 

}

// Activity request interface
interface ActivityRequestDTO {
  requestId: string;
  employeeId: string;
  activityId: string;
  createdAt: Date;
  startTime?: Date;
  endTime?: Date;
  status: string;
  requestFlds: string;
}

// Activity filter interface
interface ActivityFilter {
  activityId?: string;
  status?: string;
  employeeIdList?: string;
  startDate?: Date;
  endDate?: Date;
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
  selectedMonth: number = new Date().getMonth(); // Current month (0-11)
  selectedYear: number = new Date().getFullYear(); // Current year
  calendarWeeks: CalendarDay[][] = [];
  employeeId: string = '';
  employeeActivities: ActivityRequestDTO[] = [];
  weekStartDate: Date = new Date();
  weekEndDate: Date = new Date();
  selectedWeekday: number | null = null; // Selected weekday (0-6, null for all days)
  filteredActivities: ActivityRequestDTO[] = []; // Filtered activities based on selected day
  
  // Chart properties
  workProgressChart: ChartType;
  attendanceHoursChart: ChartType;
  
  @ViewChild('content') content;
  @ViewChild('center', { static: false }) center?: ModalDirective;
  constructor(
    private modalService: BsModalService, 
    private configService: ConfigService, 
    private eventService: EventService,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
    this.loadCurrentUserProfile();
    this.setCurrentWeekDates();
    this.fetchEmployeeActivities();
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
  }
  
  /**
   * Load current user profile from localStorage
   */
  loadCurrentUserProfile() {
    try {
      const userProfileString = localStorage.getItem('currentUserProfile');
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        this.employeeId = userProfile.employeeID || '';
        console.log('Loaded employee ID:', this.employeeId);
      }
    } catch (error) {
      console.error('Error parsing user profile from localStorage:', error);
    }
  }

  /**
   * Set start and end dates for the current week
   */
  setCurrentWeekDates() {
    // Create date with local timezone
    const currentDate = new Date();
    
    // Get the first day of the week (Sunday)
    const firstDay = new Date(currentDate);
    const day = currentDate.getDay();
    firstDay.setDate(currentDate.getDate() - day);
    firstDay.setHours(0, 0, 0, 0); // Set to start of day
    
    // Get the last day of the week (Saturday)
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    lastDay.setHours(23, 59, 59, 999); // Set to end of day
    
    this.weekStartDate = firstDay;
    this.weekEndDate = lastDay;
    
    console.log('Week dates:', {
      start: this.formatDate(this.weekStartDate),
      end: this.formatDate(this.weekEndDate)
    });
  }

  /**
   * Navigate to previous week
   */
  previousWeek() {
    const newStartDate = new Date(this.weekStartDate);
    newStartDate.setDate(this.weekStartDate.getDate() - 7);
    
    const newEndDate = new Date(this.weekEndDate);
    newEndDate.setDate(this.weekEndDate.getDate() - 7);
    
    this.weekStartDate = newStartDate;
    this.weekEndDate = newEndDate;
    this.selectedMonth = this.weekStartDate.getMonth();
    this.selectedYear = this.weekStartDate.getFullYear();
    
    this.fetchEmployeeActivities();
    this.updateCalendar();
    
    // Reset selected weekday when changing weeks
    this.selectedWeekday = null;
    this.updateFilteredActivities();
  }

  /**
   * Navigate to next week
   */
  nextWeek() {
    const newStartDate = new Date(this.weekStartDate);
    newStartDate.setDate(this.weekStartDate.getDate() + 7);
    
    const newEndDate = new Date(this.weekEndDate);
    newEndDate.setDate(this.weekEndDate.getDate() + 7);
    
    this.weekStartDate = newStartDate;
    this.weekEndDate = newEndDate;
    this.selectedMonth = this.weekStartDate.getMonth();
    this.selectedYear = this.weekStartDate.getFullYear();
    
    this.fetchEmployeeActivities();
    this.updateCalendar();
    
    // Reset selected weekday when changing weeks
    this.selectedWeekday = null;
    this.updateFilteredActivities();
  }

  /**
   * Fetch employee activities from API
   */
  fetchEmployeeActivities() {
    if (!this.employeeId) {
      console.error('No employee ID available');
      return;
    }

    // Format dates for API request
    const startYear = this.weekStartDate.getFullYear();
    const startMonth = (this.weekStartDate.getMonth() + 1).toString().padStart(2, '0');
    const startDay = this.weekStartDate.getDate().toString().padStart(2, '0');
    const startDateStr = `${startYear}-${startMonth}-${startDay}T00:00:00`;

    const endYear = this.weekEndDate.getFullYear();
    const endMonth = (this.weekEndDate.getMonth() + 1).toString().padStart(2, '0');
    const endDay = this.weekEndDate.getDate().toString().padStart(2, '0');
    const endDateStr = `${endYear}-${endMonth}-${endDay}T23:59:59`;

    const filter: ActivityFilter = {
      employeeIdList: this.employeeId,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr)
    };

    console.log('Fetching activities with filter:', {
      employeeId: this.employeeId,
      startDate: startDateStr,
      endDate: endDateStr
    });

    const params = new HttpParams({
      fromObject: {
        ...(filter.activityId && { activityId: filter.activityId }),
        ...(filter.status && { status: filter.status }),
        ...(filter.employeeIdList && { employeeIdList: filter.employeeIdList }),
        ...(filter.startDate && { startDate: startDateStr }),
        ...(filter.endDate && { endDate: endDateStr })
      }
    });

    this.http.get<ActivityRequestDTO[]>(`${API_ENDPOINT.getAllActivity}`, { params })
      .subscribe({
        next: (data) => {
          console.log('Employee activities:', data);
          this.employeeActivities = data;
          this.updateFilteredActivities();
          this.updateCalendar();
        },
        error: (error) => {
          console.error('Error fetching employee activities:', error);
        }
      });
  }
  
  /**
   * Updates the calendar based on selected month and year
   */
  updateCalendar() {
    this.calendarWeeks = [];
    
    console.log('Updating calendar with month/year:', this.selectedMonth, this.selectedYear);
    
   // lấy ngày đầu tiên/ cuối cùng trong tháng
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 1);
    const lastDayOfMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0);
    
    console.log("firstDayOfMonth - ", firstDayOfMonth);
    console.log("lastDayOfMonth - ", lastDayOfMonth);
    
    // lấy thứ đầu tiên trong tháng
    const firstDayWeekday = firstDayOfMonth.getDay();
    console.log("firstDayWeekday - ", firstDayWeekday);
    
    // số ngày còn thiếu để thành 1 hàng 7 ngày
    const daysFromPrevMonth = firstDayWeekday;
    console.log("daysFromPrevMonth - ", daysFromPrevMonth);
    
    // lấy ngày cuối cùng trong tháng trước
    const lastDayOfPrevMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    console.log("lastDayOfPrevMonth - ", lastDayOfPrevMonth);
    
    // ngày hiện tại
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
        let calendarDay: CalendarDay;
        let dayDate: Date;
        
        if (weekIndex === 0 && dayIndex < firstDayWeekday) {
          // Days from previous month
          const prevMonthDate = lastDayOfPrevMonth - daysFromPrevMonth + dayIndex + 1;
          dayDate = new Date(this.selectedYear, this.selectedMonth - 1, prevMonthDate);
          
          calendarDay = {
            date: prevMonthDate,
            isCurrentMonth: false,
            activities: this.getActivitiesForDate(dayDate)
          };
        } else if (currentDate <= lastDayOfMonth.getDate()) {
          // Days from current month
          dayDate = new Date(this.selectedYear, this.selectedMonth, currentDate);
          
          calendarDay = {
            date: currentDate,
            isCurrentMonth: true,
            activities: this.getActivitiesForDate(dayDate)
          };
          currentDate++;
        } else {
          // Days from next month
          dayDate = new Date(this.selectedYear, this.selectedMonth + 1, nextMonthDate);
          
          calendarDay = {
            date: nextMonthDate,
            isCurrentMonth: false,
            activities: this.getActivitiesForDate(dayDate)
          };
          nextMonthDate++;
        }
        
        // Determine status based on activities
        calendarDay.status = this.determineStatusFromActivities(calendarDay.activities);
        
        week.push(calendarDay);
      }
      
      this.calendarWeeks.push(week);
      
      // Stop if we've added all days for the current month and at least some days from next month
      if (currentDate > lastDayOfMonth.getDate() && nextMonthDate > 1) {
        break;
      }
    }
  }
  
  /**
   * Get activities for a specific date
   * @param date The date to check
   * @returns Activities for the date
   */
  getActivitiesForDate(date: Date): ActivityRequestDTO[] {
    if (!this.employeeActivities || !Array.isArray(this.employeeActivities)) {
      return [];
    }
    
    // Format date as YYYY-MM-DD for comparison
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return this.employeeActivities.filter(activity => {
      if (!activity.startTime) return false;
      
      // Create date object from activity start time
      const activityDate = new Date(activity.startTime);
      
      // Format activity date as YYYY-MM-DD
      const activityYear = activityDate.getFullYear();
      const activityMonth = (activityDate.getMonth() + 1).toString().padStart(2, '0');
      const activityDay = activityDate.getDate().toString().padStart(2, '0');
      const activityDateString = `${activityYear}-${activityMonth}-${activityDay}`;
      
      return activityDateString === dateString;
    });
  }
  
  /**
   * Determine calendar day status based on activities
   * @param activities Activities for the day
   * @returns Status string
   */
  determineStatusFromActivities(activities?: ActivityRequestDTO[]): string {
    if (!activities || activities.length === 0) {
      return 'none';
    }
    
    // Check if there's any activity with specific statuses
    const hasApproved = activities.some(a => a.status === 'APPROVED');
    const hasPending = activities.some(a => a.status === 'PENDING');
    const hasRejected = activities.some(a => a.status === 'REJECTED');
    
    if (hasApproved) return 'present';
    if (hasPending) return 'pending';
    if (hasRejected) return 'absent';
    
    return 'none';
  }
  
  getActivityInRequestFlds(requestFlds: string): string {
    try {
      const parsed = JSON.parse(requestFlds);
      if (parsed["0000"] && parsed["0000"].value) {
        return parsed["0000"].value;
      }
      return '';
    } catch (e) {
      console.error('Invalid JSON:', e);
      return '';
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
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      case 'overtime':
        return 'bg-info';
      case 'fullShift':
        return 'bg-primary';
      case 'late':
        return 'bg-danger';
      case 'holiday':
        return 'bg-info';
      case 'none':
      default:
        return 'bg-light';
    }
  }
  
  /**
   * Format date to display in the UI
   * @param date Date object
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
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
        height: 200,
        type: 'area',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true
        },
        sparkline: {
          enabled: false
        },
        redrawOnParentResize: true
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
        labels: {
          show: true
        }
      }
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

  /**
   * Get the date for a specific weekday in the current week
   * @param dayIndex Day index (0=Sunday, 1=Monday, etc.)
   * @returns Day of the month
   */
  getWeekdayDate(dayIndex: number): number {
    const date = new Date(this.weekStartDate);
    date.setDate(this.weekStartDate.getDate() + dayIndex);
    return date.getDate();
  }

  /**
   * Get the CSS class for a specific weekday in the current week
   * @param dayIndex Day index (0=Sunday, 1=Monday, etc.)
   * @returns CSS class string
   */
  getWeekdayStatusClass(dayIndex: number): string {
    const date = new Date(this.weekStartDate);
    date.setDate(date.getDate() + dayIndex);
    
    // Get activities for this date
    const activities = this.getActivitiesForDate(date);
    const status = this.determineStatusFromActivities(activities);
    
    // Add selected class if this is the selected weekday
    let baseClass = '';
    if (this.selectedWeekday === dayIndex) {
      baseClass = 'bg-primary-subtle';
    } else {
      // Return appropriate CSS classes based on status
      switch (status) {
        case 'present':
          baseClass = 'bg-success-subtle';
          break;
        case 'pending':
          baseClass = 'bg-warning-subtle';
          break;
        case 'absent':
          baseClass = 'bg-danger-subtle';
          break;
        default:
          baseClass = 'bg-light';
          break;
      }
    }
    
    return baseClass;
  }
  
  /**
   * Handle weekday selection
   * @param dayIndex Day index to select (0=Sunday, 1=Monday, etc.)
   */
  selectWeekday(dayIndex: number): void {
    // Toggle selection if clicking the same day again
    if (this.selectedWeekday === dayIndex) {
      this.selectedWeekday = null;
    } else {
      this.selectedWeekday = dayIndex;
    }
    
    // Update filtered activities based on selection
    this.updateFilteredActivities();
  }
  
  /**
   * Update filtered activities based on selected weekday
   */
  updateFilteredActivities(): void {
    if (this.selectedWeekday === null) {
      // If no weekday is selected, show all activities for the week
      this.filteredActivities = [...this.employeeActivities];
    } else {
      // Filter activities for the selected weekday
      const selectedDate = new Date(this.weekStartDate);
      selectedDate.setDate(this.weekStartDate.getDate() + this.selectedWeekday);
      
      this.filteredActivities = this.getActivitiesForDate(selectedDate);
    }
    
    // Log for debugging
    console.log('Filtered activities:', this.filteredActivities.length, 'Selected weekday:', this.selectedWeekday);
  }
}
