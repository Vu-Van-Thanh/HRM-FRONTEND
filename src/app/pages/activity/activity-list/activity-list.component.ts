import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Activity, ActivityStatus } from '../models/activity.model';
import { ActivityService } from '../services/activity.service';
import { ActivityDetailDialogComponent } from '../activity-detail-dialog/activity-detail-dialog.component';
import { AuthenticationService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from '../models/project.model';
import { Position } from '../models/position.model';
import { WorkLogDialogComponent } from '../work-log-dialog/work-log-dialog.component';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DepartmentService } from '../../../system/department/department.service';
import { Department } from '../../../system/department/department.model';
import { EmployeeDepartmentDTO } from 'src/app/system/salary/salary.model';
import { tap, forkJoin, catchError, of, map, Observable } from 'rxjs';
import { ActivityRegistrationComponent } from '../activity-registration/activity-registration.component';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, AfterViewInit {
  //departments: Department[] = [];
  employeeList: EmployeeDepartmentDTO[] = [];
  displayedColumns: string[] = [
    'employeeName',
    'departmentName',
    'activityType',
    'taskName',
    'startTime',
    'endTime',
    'estimatedHours',
    'status',
    'actions'
  ];
  
  personalDisplayedColumns: string[] = [
    'activityType',
    'taskName',
    'startTime',
    'endTime',
    'estimatedHours',
    'status',
    'actions'
  ];

  dataSource: MatTableDataSource<Activity> = new MatTableDataSource<Activity>([]);
  personalDataSource: MatTableDataSource<Activity> = new MatTableDataSource<Activity>([]);
  
  departments: string[] = [];
  departmentsList: Department[] = [];
  activityTypes: any[] = [];
  activityStatuses = Object.values(ActivityStatus);
  selectedDepartment: string = '';
  selectedActivityType: string | '' = '';
  selectedStatus: ActivityStatus | '' = '';
  selectedStartDate: string | '' = '';
  selectedEndDate: string | '' = '';
  
  activeTab: 'all' | 'personal' = 'all';
  isAdmin = false;
  currentUserId: number;

  @ViewChild('allPaginator') paginator: MatPaginator;
  @ViewChild('personalPaginator') personalPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('personalSort') personalSort: MatSort;

  workLogForm: FormGroup;
  showWorkLogForm = false;

  projects: Project[] = [];
  positions: Position[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Add new filter form
  advancedFilterForm: FormGroup;
  filteredActivities: Activity[] = [];
  filteredEmployees: EmployeeDepartmentDTO[] = [];
  filteredDepartments: Department[] = [];
  isLoading = false;

  constructor(
    private activityService: ActivityService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private http: HttpClient,
    private departmentService: DepartmentService,
    private router: Router,
    private toastService : ToastService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUserId();
    this.initWorkLogForm();
    
    // Initialize advanced filter form
    this.advancedFilterForm = this.fb.group({
      managerID: [''],
      departmentID: [''],
      employeeID: [''],
      activityType: [''],
      activityStatus: [''],
      startTime: [''],
      endTime: [''],
      selectedStartDate: [''],
      selectedEndDate: ['']
    });
  }

  ngOnInit(): void {
    // Tải loại hoạt động từ API
    this.activityService.getActivityTypes().subscribe(types => {
      this.activityTypes = types;
      this.route.data.subscribe(data => {
        if (data['activityType']) {
          this.selectedActivityType = data['activityType'];
        }
      });
    });
    const currentUserProfileRaw = localStorage.getItem('currentUserProfile');
    if (currentUserProfileRaw) {
      try {
        const currentUserProfile = JSON.parse(currentUserProfileRaw);
        if (currentUserProfile.employeeID) {
          this.currentUserId = currentUserProfile.employeeID;
        }
      } catch (error) {
        console.error('❌ Lỗi khi parse currentUserProfile từ localStorage:', error);
      }
    }
    this.loadProjects();
    this.loadPositions();
    this.loadDepartments();
    this.loadActivities();
    this.loadPersonalActivities();
    //this.loadEmployeeData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.personalDataSource.paginator = this.personalPaginator;
    this.personalDataSource.sort = this.personalSort;
  }

  initWorkLogForm(): void {
    this.workLogForm = this.fb.group({
      projectId: ['', Validators.required],
      positionId: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date(), Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  loadProjects(): void {
    // Replace mock data with API call
    this.http.get<Project[]>(API_ENDPOINT.getAllProjects)
      .pipe(
        tap(projects => console.log('✅ Danh sách dự án:', projects)),
        catchError(error => {
          console.error('❌ Lỗi khi tải danh sách dự án:', error);
          return of([]);
        })
      )
      .subscribe(projects => {
        this.projects = projects;
      });
  }

  loadPositions(): void {
    // Replace mock data with API call
    this.http.get<Position[]>(API_ENDPOINT.getAllPositions)
      .pipe(
        tap(positions => console.log('✅ Danh sách vị trí:', positions)),
        catchError(error => {
          console.error('❌ Lỗi khi tải danh sách vị trí:', error);
          return of([]);
        })
      )
      .subscribe(positions => {
        this.positions = positions;
      });
  }

  loadActivities(): void {
    const formValues = this.advancedFilterForm.value;
    const employeeFilter = {
      department: this.selectedDepartment || formValues.departmentID || '',
      managerId: formValues.managerID || ''
    };

    // Đầu tiên tải danh sách phòng ban
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departmentsList = departments;
        
        if (!this.departmentsList || this.departmentsList.length === 0) {
          console.warn('⚠️ Không có dữ liệu phòng ban hoặc dữ liệu không đúng định dạng');
        }
        
        this.http.get<EmployeeDepartmentDTO[]>(API_ENDPOINT.getEmployeeID, { params: employeeFilter })
          .pipe(
            tap(employees => {
            }),
            map(employees => {
              return employees.map(emp => {
                if (emp.departmentName?.trim()) return emp;
                
                if (!emp.departmentID) {
                  return emp;
                }
                try {
                  const deptIdStr = emp.departmentID.toString();
                  let department = null;
                  for(var i = 0; i < this.departmentsList.length; i++){
                    if(this.departmentsList[i].code.toString() === deptIdStr){
                      department = this.departmentsList[i];
                      break;
                    }
                  }
                  
                  if (department && department.name) {
                    return {
                      ...emp,
                      departmentName: department.name
                    };
                  } else {
                    console.warn(`⚠️ Không tìm thấy tên phòng ban cho departmentID: ${deptIdStr}`);
                  }
                } catch (error) {
                  console.error('❌ Lỗi khi map departmentID sang departmentName:', error);
                }
                
                return emp;
              });
            }),
            tap(employees => {
              this.employeeList = employees;
            })
          )
          .subscribe({
            next: (employees) => {
              const employeeIds = employees.map(emp => emp.employeeID).join(',');
              const params: any = {};
              // Only add parameters that have values
              if (employeeIds) params.EmployeeIdList = employeeIds;
              if (formValues.activityType) params.ActivityId = formValues.activityType;
              if (formValues.activityStatus) params.Status = formValues.activityStatus;
              if (formValues.startTime) params.StartDate = new Date(formValues.startTime).toISOString();
              if (formValues.endTime) params.EndDate = new Date(formValues.endTime).toISOString();
              console.log('📁 PARAMS BEING SENT:', params);
              
              // Gọi API để lấy danh sách hoạt động với danh sách nhân viên đã lọc
              this.activityService.getActivities(params).subscribe({
                next: (activities) => {
                  console.log('🔍Danh sách hoạt động đã nhận được:', activities);
                  // Map dữ liệu nhận được để hiển thị lên giao diện
                  const mappedActivities = activities.map(activity => {
                    // Tìm thông tin nhân viên từ employeeId
                    const employee = this.employeeList.find(emp => emp.employeeID === activity.employeeId);
                    
                    // Lấy tên phòng ban từ employee đã được fill
                    let departmentName = activity.departmentName || 'N/A';
                    if ((!departmentName || departmentName === 'N/A') && employee && employee.departmentName) {
                      departmentName = employee.departmentName;
                    }
                    else if ((!departmentName || departmentName === 'N/A') && employee && employee.departmentID) {
                      const department = this.departmentsList.find(dept => 
                        dept && dept.id && dept.id.toString() === employee.departmentID.toString()
                      );
                      departmentName = department ? department.name : 'N/A';
                    }
                    
                    // Parse requestFlds nếu có
                    let taskName = '';
                    let reason = '';
                    let estimatedHours = 0;
                    
                    if (activity.startTime && activity.endTime) {
                      const startTime = new Date(activity.startTime);
                      const endTime = new Date(activity.endTime);
                      const diffMs = endTime.getTime() - startTime.getTime();
                      // Chuyển đổi từ mili giây sang giờ và làm tròn đến 2 chữ số thập phân
                      estimatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
                    }
                    
                    if (activity.requestFlds) {
                      try {
                        const requestFldsObj = JSON.parse(activity.requestFlds);
                        taskName = requestFldsObj.TaskName || '';
                        reason = requestFldsObj.TaskName || '';
                        // Sử dụng estimatedHours từ requestFlds nếu có, nếu không sử dụng giá trị đã tính
                        if (requestFldsObj.estimatedHours) {
                          estimatedHours = requestFldsObj.estimatedHours.value || estimatedHours;
                        }
                      } catch (e) {
                        console.error('Lỗi khi parse requestFlds:', e);
                      }
                    }
                    return {
                      ...activity,
                      employeeName: employee ? employee.employeeName : 'N/A',
                      departmentName: departmentName,
                      taskName: taskName,
                      reason: reason,
                      estimatedHours: estimatedHours,
                      activityType: this.activityTypes.find(type => type.activityId === activity.activityId)?.activityType || activity.activityId
                    };
                  });
                  this.dataSource.data = mappedActivities;
                  this.departments = [...new Set(mappedActivities.map(activity => activity.departmentName))];
                },
                error: (error) => {
                  console.error('Error loading activities:', error);
                }
              });
            },
            error: (error) => {
              console.error('❌ Lỗi khi tải dữ liệu nhân viên:', error);
            }
          });
      },
      error: (error) => {
        console.error('❌ Lỗi khi tải dữ liệu phòng ban:', error);
      }
    });
  }

  loadPersonalActivities(): void {
    // Với loadPersonalActivities, chúng ta cũng cần tải phòng ban để mapping
    const formValues = this.advancedFilterForm.value;
    
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departmentsList = departments;
        const params: any = {};
              
        // Only add parameters that have values
        if (this.currentUserId) params.EmployeeIdList = this.currentUserId;
        if (formValues.activityType) params.ActivityId = formValues.activityType;
        if (formValues.activityStatus) params.Status = formValues.activityStatus;
        if (formValues.selectedStartDate) params.StartDate = new Date(formValues.selectedStartDate).toISOString();
        if (formValues.selectedEndDate) params.EndDate = new Date(formValues.selectedEndDate).toISOString();
        
        console.log('📁 PARAMS BEING SENT (personal):', params);
        this.activityService.getActivities(params).subscribe({
          next: (activities) => {
            // Map dữ liệu nhận được để hiển thị lên giao diện
            const mappedActivities = activities.map(activity => {
              // Lấy thông tin phòng ban từ danh sách nhân viên nếu đã được fill
              let departmentName = activity.departmentName || 'N/A';
              
              // Nếu không có departmentName hoặc employeeId, tìm kiếm trong departmentsList
              if ((!departmentName || departmentName === 'N/A') && activity.employeeId) {
                const employee = this.employeeList.find(emp => emp.employeeID === activity.employeeId);
                if (employee && employee.departmentName) {
                  departmentName = employee.departmentName;
                }
              }
              
              // Parse requestFlds nếu có
              let taskName = '';
              let reason = '';
              let estimatedHours = 0;
              
              // Tính toán estimatedHours từ startTime và endTime
              if (activity.startTime && activity.endTime) {
                const startTime = new Date(activity.startTime);
                const endTime = new Date(activity.endTime);
                const diffMs = endTime.getTime() - startTime.getTime();
                // Chuyển đổi từ mili giây sang giờ và làm tròn đến 2 chữ số thập phân
                estimatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
              }
              
              if (activity.requestFlds) {
                try {
                  const requestFldsObj = JSON.parse(activity.requestFlds);
                  taskName = requestFldsObj.TaskName || '';
                  reason = requestFldsObj.TaskName || '';
                  // Sử dụng estimatedHours từ requestFlds nếu có, nếu không sử dụng giá trị đã tính
                  if (requestFldsObj.estimatedHours) {
                    estimatedHours = requestFldsObj.estimatedHours.value || estimatedHours;
                  }
                } catch (e) {
                  console.error('Lỗi khi parse requestFlds:', e);
                }
              }
              
              return {
                ...activity,
                departmentName: departmentName,
                taskName: taskName,
                reason: reason,
                estimatedHours: estimatedHours,
                activityType: this.activityTypes.find(type => type.activityId === activity.activityId)?.activityType || activity.activityId
              };
            });
            
            this.personalDataSource.data = mappedActivities;
            console.log('🔍 Hoạt động cá nhân đã map:', mappedActivities);
          },
          error: (error) => {
            console.error('Error loading personal activities:', error);
          }
        });
      },
      error: (error) => {
        console.error('❌ Lỗi khi tải dữ liệu phòng ban (personal):', error);
      }
    });
  }

  onFilterChange(): void {
    if (this.activeTab === 'all') {
      this.loadActivities();
    } else {
      this.loadPersonalActivities();
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.activeTab === 'all') {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    } else {
      this.personalDataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  onTabChange(tab: 'all' | 'personal'): void {
    this.activeTab = tab;
    if (tab === 'all') {
      this.loadActivities();
    } else {
      this.loadPersonalActivities();
    }
  }

  onViewDetail(activity: Activity): void {
    const dialogRef = this.dialog.open(ActivityDetailDialogComponent, {
      width: '800px',
      data: { activity }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadActivities();
        this.loadPersonalActivities();
      }
    });
  }

  onApprove(activity: Activity): void {
    this.activityService.approveActivity(activity).subscribe({
      next: () => {
        this.loadActivities();
        this.loadPersonalActivities();
      },
      error: (error) => {
        console.error('Error approving activity:', error);
      }
    });
  }

  onReject(activity: Activity): void {
    const dialogRef = this.dialog.open(ActivityDetailDialogComponent, {
      width: '500px',
      data: { 
        activity,
        isReject: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activityService.rejectActivity(activity, result.reason).subscribe({
          next: () => {
            this.toastService.success('Yêu cầu đã bị từ chối');
            this.loadActivities();
            this.loadPersonalActivities();
          },
          error: (error) => {
            console.error('Error rejecting activity:', error);
          }
        });
      }
    });
  }

  onAddWorkLog(): void {
    const dialogRef = this.dialog.open(WorkLogDialogComponent, {
      width: '600px',
      data: {
        projects: this.projects,
        positions: this.positions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Tạo object activity từ form data
        const activity = {
          ...result,
          activityType: 'ATTENDANCE',
          status: 'PENDING',
          employeeId: this.currentUserId.toString(),
          employeeName: 'Nguyễn Văn A', // TODO: Lấy tên thật từ AuthService
          projectName: this.projects.find(p => p.id === result.projectId)?.name,
          positionName: this.positions.find(p => p.id === result.positionId)?.name,
          date: result.date,
          startTime: result.startTime,
          endTime: result.endTime,
          description: result.description
        };

        // Gọi API để lưu activity
        this.activityService.createActivity(activity).subscribe({
          next: (response) => {
            // Thêm activity mới vào dataSource
            const currentData = this.personalDataSource.data;
            this.personalDataSource.data = [activity, ...currentData];
            
            // Hiển thị thông báo thành công
            console.log('Khai công thành công');
          },
          error: (error) => {
            console.error('Lỗi khi khai công:', error);
          }
        });
      }
    });
  }

  onCancelWorkLog(): void {
    this.showWorkLogForm = false;
    this.workLogForm.reset();
  }

  onSubmitWorkLog(): void {
    if (this.workLogForm.valid) {
      const workLog = {
        ...this.workLogForm.value,
        activityType: 'ATTENDANCE',
        status: 'PENDING'
      };

      // TODO: Replace with actual API call
      this.activityService.createActivity(workLog).subscribe(
        response => {
          this.showWorkLogForm = false;
          this.workLogForm.reset();
          this.loadActivities();
          // Show success message
        },
        error => {
          // Show error message
        }
      );
    }
  }

  onEditActivity(activity: Activity): void {
    const dialogRef = this.dialog.open(WorkLogDialogComponent, {
      width: '600px',
      data: {
        projects: this.projects,
        positions: this.positions,
        activity: activity,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Cập nhật activity
        const updatedActivity = {
          ...activity,
          ...result,
          projectName: this.projects.find(p => p.id === result.projectId)?.name,
          positionName: this.positions.find(p => p.id === result.positionId)?.name,
        };

        this.activityService.updateActivity(activity.requestId, updatedActivity).subscribe({
          next: () => {
            // Cập nhật lại danh sách
            this.loadPersonalActivities();
            console.log('Cập nhật khai công thành công');
          },
          error: (error) => {
            console.error('Lỗi khi cập nhật khai công:', error);
          }
        });
      }
    });
  }

  onDeleteActivity(activity: Activity): void {
    if (activity.activityType !== 'ATTENDANCE') {
      return;
    }

    const dialogRef = this.dialog.open(ActivityDetailDialogComponent, {
      width: '400px',
      data: { 
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa khai công này không?',
        activity,
        isDelete: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activityService.deleteActivity(activity.requestId).subscribe({
          next: () => {
            // Cập nhật lại danh sách hoạt động
            this.loadPersonalActivities();
            
            // Hiển thị thông báo thành công
            console.log('Xóa khai công thành công');
          },
          error: (error) => {
            console.error('Lỗi khi xóa khai công:', error);
          }
        });
      }
    });
  }

  /**
   * Tải danh sách phòng ban từ API
   */
  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe(
      departments => {
        this.departmentsList = departments;
      },
      error => {
        console.error('❌ Lỗi khi tải dữ liệu phòng ban:', error);
        this.departmentsList = [];
      }
    );
  }

  /**
   * Tải danh sách nhân viên từ API theo bộ lọc
   */
  loadEmployeeData(): void {
    const formValues = this.advancedFilterForm.value;
    
    const employeeFilter = {
      department: formValues.departmentID || '',
      jobTitle: '',
      managerId: formValues.managerID || '',
      employeeId: formValues.employeeID || ''
    };

    console.log('🔍 Áp dụng bộ lọc nhân viên:', employeeFilter);

    // Tải danh sách nhân viên dựa trên bộ lọc
    this.http.get<EmployeeDepartmentDTO[]>(API_ENDPOINT.getEmployeeID, { params: employeeFilter })
      .pipe(
        tap(employees => {
          console.log('📌 Danh sách nhân viên sau khi lọc:', employees);
          this.employeeList = employees;
        })
      )
      .subscribe({
        error: error => {
          console.error('❌ Lỗi khi tải dữ liệu nhân viên:', error);
        }
      });
  }

  
  loadActivityDataWithFilters(): void {
    this.isLoading = true;
    
    // Tạo bản sao của form value để không ảnh hưởng đến form gốc
    const filters = { ...this.advancedFilterForm.value };

    // Trước tiên, tải danh sách phòng ban
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.filteredDepartments = departments;
        console.log('📁 Danh sách phòng ban (filtered):', departments);
        
        // Sau đó tải danh sách nhân viên theo bộ lọc
        const employeeFilter = {
          department: filters.departmentID || '',
          managerId: filters.managerID || '',
          employeeId: filters.employeeID || ''
        };

        // Tải danh sách nhân viên
        this.http.get<EmployeeDepartmentDTO[]>(API_ENDPOINT.getEmployeeID, { params: employeeFilter })
          .pipe(
            tap(employees => {
              console.log('📌 Danh sách nhân viên trước khi fill phòng ban (filtered):', employees);
            }),
            // Bổ sung departmentName nếu thiếu
            map(employees => {
              return employees.map(emp => {
                // Nếu nhân viên đã có departmentName thì giữ nguyên
                if (emp.departmentName) return emp;
                
                // Thêm kiểm tra an toàn cho departmentID
                if (!emp.departmentID) {
                  console.warn('⚠️ Employee missing departmentID:', emp);
                  return emp;
                }

                try {
                  // Chuyển đổi departmentID sang string để so sánh an toàn
                  const deptIdStr = emp.departmentID.toString();
                  
                  // Tìm kiếm phòng ban với kiểm tra null/undefined
                  const department = this.filteredDepartments.find(dept => 
                    dept && dept.id && dept.id.toString() === deptIdStr
                  );
                  
                  if (department && department.name) {
                    return {
                      ...emp,
                      departmentName: department.name
                    };
                  } else {
                    console.warn(`⚠️ Không tìm thấy tên phòng ban cho departmentID: ${deptIdStr}`);
                  }
                } catch (error) {
                  console.error('❌ Lỗi khi map departmentID sang departmentName:', error);
                }
                
                return emp;
              });
            }),
            tap(employees => {
              console.log('📌 Danh sách nhân viên sau khi fill phòng ban (filtered):', employees);
              this.filteredEmployees = employees;
            })
          )
          .subscribe({
            next: (employees) => {
              // Nối các ID nhân viên với dấu ","
              const employeeIds = employees.map(emp => emp.employeeID).join(',');
              
              // Tạo parameters cho API lấy hoạt động
              const activityParams = {
                employeeIds: employeeIds,
                activityType: filters.activityType || '',
                activityStatus: filters.activityStatus || '',
                startTime: filters.startTime || '',
                endTime: filters.endTime || ''
              };
              
              // Tải danh sách hoạt động
              this.activityService.getActivitiesByFilter(activityParams).subscribe({
                next: (activities) => {
                  // Xử lý dữ liệu từ API để phù hợp với model
                  const formattedActivities: Activity[] = activities.map(item => {
                    // Tìm thông tin nhân viên và phòng ban
                    const employee = this.filteredEmployees.find(emp => emp.employeeID === item.employeeId);
                    
                    // Lấy tên phòng ban từ employee đã được fill
                    let departmentName = item.departmentName || 'N/A';
                    if ((!departmentName || departmentName === 'N/A') && employee && employee.departmentName) {
                      departmentName = employee.departmentName;
                    }
                    else if ((!departmentName || departmentName === 'N/A') && employee && employee.departmentID) {
                      const department = this.filteredDepartments.find(dept => 
                        dept && dept.id && dept.id.toString() === employee.departmentID.toString()
                      );
                      departmentName = department ? department.name : 'N/A';
                    }
                    
                    // Parse requestFlds nếu có
                    let activityType = item.activityId; // Gán activityType = activityId
                    let reason = '';
                    let taskName = '';
                    let estimatedHours = 0;
                    
                    // Parse requestFlds nếu có
                    if (item.requestFlds) {
                      try {
                        const requestFldsObj = JSON.parse(item.requestFlds);
                        reason = requestFldsObj.TaskName || '';
                        taskName = requestFldsObj.TaskName || '';
                        estimatedHours = requestFldsObj.EstimatedHours || 0;
                      } catch (e) {
                        console.error('Lỗi khi parse requestFlds:', e);
                      }
                    }
                    
                    return {
                      ...item,
                      employeeName: employee ? employee.employeeName : this.getEmployeeName(item.employeeId),
                      departmentName: departmentName,
                      activityType: activityType,
                      taskName: taskName,
                      estimatedHours: estimatedHours,
                      reason: reason
                    };
                  });
                  
                  // Cập nhật danh sách hoạt động
                  this.filteredActivities = formattedActivities;
                  this.isLoading = false;
                  console.log('🔍 Danh sách hoạt động đã lọc và map:', formattedActivities);
                },
                error: (error) => {
                  console.error('Lỗi khi tải dữ liệu hoạt động:', error);
                  this.isLoading = false;
                }
              });
            },
            error: (error) => {
              console.error('Lỗi khi tải dữ liệu nhân viên:', error);
              this.isLoading = false;
            }
          });
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu phòng ban:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Áp dụng bộ lọc nâng cao
   */
  applyAdvancedFilter(): void {
    console.log('Applying advanced filter with values:', this.advancedFilterForm.value);
    if (this.activeTab === 'all') {
      this.loadActivities();
    } else {
      this.loadPersonalActivities();
    }
  }

  /**
   * Reset bộ lọc nâng cao
   */
  resetAdvancedFilter(): void {
    this.advancedFilterForm.reset({
      managerID: '',
      departmentID: '',
      employeeID: '',
      activityType: '',
      activityStatus: '',
      startTime: '',
      endTime: '',
      selectedStartDate: '',
      selectedEndDate: ''
    });
    
    if (this.activeTab === 'all') {
      this.loadActivities();
    } else {
      this.loadPersonalActivities();
    }
  }

  /**
   * Lấy tên nhân viên từ ID
   */
  getEmployeeName(employeeId?: string): string {
    if (!employeeId) return 'N/A';
    const employee = this.employeeList.find(e => e.employeeID === employeeId);
    return employee?.employeeName || 'N/A';
  }

  /**
   * Lấy tên phòng ban từ ID
   */
  getDepartmentName(departmentId?: number): string {
    if (!departmentId) return 'N/A';
    const department = this.departmentsList.find(d => d && d.id && d.id === departmentId);
    return department?.name || 'N/A';
  }

  // Phương thức lấy tên của loại hoạt động
  getActivityTypeName(activity: Activity): string {
    if (!activity.activityType) return '';
    
    const activityTypeObj = this.activityTypes.find(type => type.activityId === activity.activityType);
    return activityTypeObj ? activityTypeObj.activityType : activity.activityType;
  }

  // Phương thức định dạng thời gian
  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('vi-VN');
  }

  // Phương thức lấy trạng thái hiển thị
  getStatusDisplay(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ phê duyệt';
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  }

  // Phương thức lấy class cho trạng thái
  getStatusClass(status: string): string {
    if (!status) return '';
    
    const upperStatus = status.toUpperCase();
    return upperStatus === 'PENDING' ? 'badge bg-warning' :
           upperStatus === 'APPROVED' ? 'badge bg-success' :
           upperStatus === 'REJECTED' ? 'badge bg-danger' : '';
  }

  showActivityTypeSelector(): void {
    const dialogRef = this.dialog.open(ActivityRegistrationComponent, {
      width: '800px',
      height: '80%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh activities after successful registration
        this.loadActivities();
        this.loadPersonalActivities();
      }
    });
  }
} 