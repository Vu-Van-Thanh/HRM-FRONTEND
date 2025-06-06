import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { ChartType, AttendaceFilterDTO,AttendaceResponseDTO, ProjectTaskInfo } from './dashboard.model';
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

// Activity hours interface
interface ActivityHours {
  type: string;
  hours: number;
  percentage: number;
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
  activityHoursChart: ChartType;
  
  // Activity hours statistics
  activityStats: ActivityHours[] = [];
  totalActivityHours: string = '0';
  
  // Task properties
  employeeTasks: ProjectTaskInfo[] = [];
  completedTasks: number = 0;
  totalTasks: number = 0;
  tasksByStatus: { [status: string]: number } = {};
  tasksByPriority: { [priority: string]: number } = {};
  
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
    this.initActivityHoursChart();
    this.fetchAttendanceRecords();
    this.fetchEmployeeTasks();
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
    this.selectedWeekday = null;
    this.updateFilteredActivities();
  }

  /**
   * Calculate activity hours from activities
   */
  calculateActivityHours() {
    const activityStats: { [key: string]: ActivityHours } = {
      'leave': { type: 'Nghỉ phép', hours: 0, percentage: 0 },
      'overtime': { type: 'Tăng ca', hours: 0, percentage: 0 },
      'workfromhome': { type: 'Làm từ xa', hours: 0, percentage: 0 }
    };
    
    let totalHours = 0;
    
    this.employeeActivities.forEach(activity => {
      if (activity.startTime && activity.endTime) {
        const startTime = new Date(activity.startTime);
        const endTime = new Date(activity.endTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        totalHours += durationHours;
        const activityName = this.getActivityInRequestFlds(activity.requestFlds).toLowerCase();
        if (activityName.includes('nghỉ') || activityName.includes('phép')) {
          activityStats['leave'].hours += durationHours;
        } else if (activityName.includes('tăng ca') || activityName.includes('overtime')) {
          activityStats['overtime'].hours += durationHours;
        } else if (activityName.includes('làm từ xa') || activityName.includes('remote')) {
          activityStats['workfromhome'].hours += durationHours;
        } else {
          // Check if the activity name exists in activityStats, if not create it
          if (!activityStats[activityName]) {
            activityStats[activityName] = { type: activityName, hours: 0, percentage: 0 };
          }
          activityStats[activityName].hours += durationHours;
        }
      }
    });
    
    if (totalHours > 0) {
      Object.keys(activityStats).forEach(key => {
        activityStats[key].percentage = (activityStats[key].hours / totalHours) * 100;
      });
    }
    const result = Object.values(activityStats)
      .filter(item => item.hours > 0)
      .sort((a, b) => b.hours - a.hours);
    
    this.totalActivityHours = totalHours.toFixed(1) + 'h';
    
    if (result.length === 0) {
      result.push({ type: 'Không có dữ liệu', hours: 0, percentage: 100 });
    }
    
    return result;
  }

  /**
   * Fetch employee activities from API
   */
  fetchEmployeeActivities() {
    if (!this.employeeId) {
      console.error('No employee ID available');
      return;
    }

    const filter: ActivityFilter = {
      employeeIdList: this.employeeId
    };

    console.log('Fetching activities with filter:', {
      employeeId: this.employeeId
    });

    const params = new HttpParams({
      fromObject: {
        ...(filter.activityId && { activityId: filter.activityId }),
        ...(filter.status && { status: filter.status }),
        ...(filter.employeeIdList && { employeeIdList: filter.employeeIdList }),
        ...(filter.startDate && { startDate: filter.startDate.toISOString() }),
        ...(filter.endDate && { endDate: filter.endDate.toISOString() })
      }
    });

    this.http.get<ActivityRequestDTO[]>(`${API_ENDPOINT.getAllActivity}`, { params })
      .subscribe({
        next: (data) => {
          console.log('Employee activities:', data);
          this.employeeActivities = data;
          
          // Calculate activity hours and update chart
          this.activityStats = this.calculateActivityHours();
          this.updateActivityHoursChart();
          
          this.updateFilteredActivities();
          this.updateCalendar();
        },
        error: (error) => {
          console.error('Error fetching employee activities:', error);
        }
      });
  }
  
  /**
   * Updates the activity hours chart with calculated data
   */
  updateActivityHoursChart() {
    const series = this.activityStats.map(stat => Math.round(stat.hours * 10) / 10);
    const labels = this.activityStats.map(stat => stat.type);
    
    // Update chart data
    this.activityHoursChart.series = series;
    this.activityHoursChart.labels = labels;
  }
  
  /**
   * Initialize activity hours chart
   */
  private initActivityHoursChart() {
    this.activityHoursChart = {
      chart: {
        height: 150,
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
      series: [0],
      labels: ['Đang tải...'],
      colors: ['#5b73e8', '#50a5f1', '#f46a6a', '#f1b44c'],
      legend: {
        show: false
      }
    };
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
    
    // Fetch attendance records to update the calendar
    this.fetchAttendanceRecords();
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
   * Determine status from attendance records
   */
  determineStatusFromAttendance(attendanceRecords: AttendaceResponseDTO[]): string {
    let totalHours = 0;

    // Calculate total hours worked
    attendanceRecords.forEach(record => {
      if (record.Starttime && record.Endtime) {
        const start = new Date(record.Starttime);
        const end = new Date(record.Endtime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += duration;
      }
    });

    // If total hours = 8, mark as fullDay (Khai công đủ)
    if (totalHours >= 8) {
      return 'fullDay';
    } 
    // If less than 8 hours but greater than 0, mark as insufficient (Khai công thiếu)
    else if (totalHours > 0) {
      return 'insufficient';
    }
    // Default case - chưa khai
    return 'notSubmitted';
  }

  /**
   * Determine calendar day status based on activities
   * @param activities Activities for the day
   * @returns Status string
   */
  determineStatusFromActivities(activities?: ActivityRequestDTO[]): string {
    if (!activities || activities.length === 0) {
      return 'notSubmitted'; // Changed from 'none' to 'notSubmitted'
    }
    
    let totalHours = 0;

    activities.forEach(activity => {
      if (activity.startTime && activity.endTime) {
        const start = new Date(activity.startTime);
        const end = new Date(activity.endTime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += duration;
      }
    });

    // If total time = 8 hours => Khai công đủ
    if (totalHours >= 8) {
      return 'fullDay';
    }
    // If has hours but less than 8 => Khai công thiếu
    else if (totalHours > 0) {
      return 'insufficient';
    }
      
    // Check if there's any activity with specific statuses
    const hasApproved = activities.some(a => a.status === 'APPROVED');
    const hasPending = activities.some(a => a.status === 'PENDING');
    const hasRejected = activities.some(a => a.status === 'REJECTED');
    
    if (hasApproved) return 'present';
    if (hasPending) return 'pending';
    if (hasRejected) return 'absent';
    
    return 'notSubmitted';
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
      case 'fullDay':
        return 'bg-success';
      case 'insufficient':
        return 'bg-danger';
      case 'late':
        return 'bg-danger';
      case 'holiday':
        return 'bg-info';
      case 'notSubmitted':
        return 'bg-secondary';
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
        name: 'Công việc',
        data: [0, 0, 0, 0, 0, 0, 0]
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

  /**
   * Fetch attendance records for the current employee
   */
  fetchAttendanceRecords() {
    if (!this.employeeId) {
      console.error('No employee ID available');
      return;
    }

    // Create first and last day of current month
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 1);
    const lastDayOfMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0);

    const filter: AttendaceFilterDTO = {
      StartDate: firstDayOfMonth,
      EndDate: lastDayOfMonth,
      EmployeeIDList: this.employeeId,
      Starttime: new Date(),
      Endtime: new Date(),
      ProjectId: '',
      Position: '',
      Status: ''
    };

    console.log('Fetching attendance with filter:', filter);

    const params = new HttpParams({
      fromObject: {
        ...(filter.StartDate && { StartDate: filter.StartDate.toISOString() }),
        ...(filter.EndDate && { EndDate: filter.EndDate.toISOString() }),
        ...(filter.EmployeeIDList && { EmployeeIDList: filter.EmployeeIDList }),
        ...(filter.Status && { Status: filter.Status })
      }
    });

    this.http.get<AttendaceResponseDTO[]>(`${API_ENDPOINT.getAllAttendace}`, { params })
      .subscribe({
        next: (data) => {
          console.log('Attendance records:', data);
          
          // Update calendar with attendance data
          this.updateCalendarWithAttendance(data);
        },
        error: (error) => {
          console.error('Error fetching attendance records:', error);
        }
      });
  }

  /**
   * Update calendar with attendance data
   */
  updateCalendarWithAttendance(attendanceRecords: AttendaceResponseDTO[]) {
    // Process each calendar day and match with attendance
    for (const week of this.calendarWeeks) {
      for (const day of week) {
        if (!day.date) continue;
        
        // Create date object for the current calendar day
        const dayDate = new Date(this.selectedYear, this.selectedMonth, day.date);
        
        // Find attendance records for this day
        const dayAttendance = attendanceRecords.filter(record => {
          const recordDate = new Date(record.AttendanceDate);
          return recordDate.getDate() === dayDate.getDate() && 
                 recordDate.getMonth() === dayDate.getMonth() && 
                 recordDate.getFullYear() === dayDate.getFullYear();
        });
        
        // Set status based on attendance
        if (dayAttendance.length > 0) {
          day.status = this.determineStatusFromAttendance(dayAttendance);
        }
      }
    }
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
   * Fetch tasks assigned to the employee
   */
  fetchEmployeeTasks() {
    if (!this.employeeId) {
      console.error('No employee ID available');
      return;
    }

    console.log('Fetching tasks for employee:', this.employeeId);

    this.http.get<ProjectTaskInfo[]>(`${API_ENDPOINT.getTasksByAssignedTo}/${this.employeeId}`)
      .subscribe({
        next: (tasks) => {
          console.log('Employee tasks:', tasks);
          this.employeeTasks = tasks;
          
          // Calculate task statistics
          this.calculateTaskStatistics();
          
          // Update work progress chart
          this.updateWorkProgressChart();
        },
        error: (error) => {
          console.error('Error fetching employee tasks:', error);
        }
      });
  }

  /**
   * Calculate task statistics
   */
  calculateTaskStatistics() {
    // Reset counters
    this.totalTasks = this.employeeTasks.length;
    this.completedTasks = 0;
    this.tasksByStatus = {};
    this.tasksByPriority = {};
    
    // Calculate statistics
    this.employeeTasks.forEach(task => {
      // Count by status
      if (!this.tasksByStatus[task.status]) {
        this.tasksByStatus[task.status] = 0;
      }
      this.tasksByStatus[task.status]++;
      
      // Count completed tasks
      if (task.status === 'Completed' || task.status === 'Done') {
        this.completedTasks++;
      }
      
      // Count by priority
      if (!this.tasksByPriority[task.priority]) {
        this.tasksByPriority[task.priority] = 0;
      }
      this.tasksByPriority[task.priority]++;
    });
    
    console.log('Task statistics:', {
      total: this.totalTasks,
      completed: this.completedTasks,
      byStatus: this.tasksByStatus,
      byPriority: this.tasksByPriority
    });
  }

  /**
   * Update work progress chart with task data
   */
  updateWorkProgressChart() {
    // Create data for chart
    const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const tasksByDay = Array(7).fill(0);
    
    // Count tasks by due date weekday
    this.employeeTasks.forEach(task => {
      if (task.deadline) {
        const deadline = new Date(task.deadline);
        const weekdayIndex = deadline.getDay();
        // Convert Sunday (0) to be the last day (6)
        const adjustedIndex = weekdayIndex === 0 ? 6 : weekdayIndex - 1;
        tasksByDay[adjustedIndex]++;
      }
    });
    
    // Update chart data
    this.workProgressChart.series = [{
      name: 'Công việc',
      data: tasksByDay
    }];
    
    // Update chart categories
    this.workProgressChart.xaxis = {
      categories: weekdays,
      labels: {
        show: true
      }
    };
  }
}
