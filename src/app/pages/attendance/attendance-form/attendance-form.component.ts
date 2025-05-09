import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'angular-toastify';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

interface Project {
  projectId: string;
  name: string;
}

@Component({
  selector: 'app-attendance-form',
  templateUrl: './attendance-form.component.html',
  styleUrls: ['./attendance-form.component.scss']
})
export class AttendanceFormComponent implements OnInit {
  attendanceForm: FormGroup;
  isEditMode = false;
  duration: string = '00:00';

  projects: Project[] = [];
  projectNames: string[] = [];

  activities: string[] = [
    'Lập trình',
    'Phân tích',
    'Quản trị',
    'Support',
    'Test',
    'Thiết kế'
  ];

  costCenters: string[] = [
    'IT Department',
    'HR Department',
    'Finance Department'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AttendanceFormComponent>,
    private toastService: ToastService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.attendanceForm = this.fb.group({
      project: ['', Validators.required],
      activity: ['', Validators.required],
      description: [''],
      date: [new Date(), Validators.required],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      overtime: [0],
      notes: [''],
      costCenter: [''],
      estimatedCost: [0]
    });

    if (data) {
      this.isEditMode = true;
      // Populate form with existing data
      this.attendanceForm.patchValue({
        project: data.project || data.projectName,
        activity: data.activity,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        notes: data.notes || '',
        costCenter: data.costCenter || '',
        estimatedCost: data.estimatedCost || 0
      });
    }
  }

  ngOnInit(): void {
    this.loadProjects();
    this.attendanceForm.valueChanges.subscribe(() => {
      this.calculateDuration();
    });
  }

  loadProjects(): void {
    console.log('Loading projects from:', API_ENDPOINT.getAllProject);
    this.http.get<any>(API_ENDPOINT.getAllProject)
      .pipe(
        map(response => {
          console.log('Raw project response:', response);
          let projects: Project[] = [];
          if (Array.isArray(response)) {
            projects = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            projects = response.data;
          } else {
            console.error('Unexpected project response format:', response);
            projects = [];
          }
          
          return projects.map(project => ({
            projectId: project.projectId || '',
            name: project.name || 'Unknown Project'
          }));
        }),
        catchError(error => {
          console.error('Error fetching projects:', error);
          this.toastService.error('Failed to load projects');
          return of([]);
        })
      )
      .subscribe(projects => {
        this.projects = projects;
        this.projectNames = projects.map(p => p.name);
        console.log('Projects loaded:', this.projects);
        
        // If no projects were loaded, create a fallback
        if (!this.projects || this.projects.length === 0) {
          this.useFallbackProjects();
        }
      });
  }
  
  private useFallbackProjects(): void {
    this.projects = [
      { projectId: '1', name: 'TCB CBP Kinh doanh HN' },
      { projectId: '2', name: 'Viettel CRM' },
      { projectId: '3', name: 'FPT ERP' },
      { projectId: '4', name: 'VNPT Billing System' }
    ];
    this.projectNames = this.projects.map(p => p.name);
    console.log('Using fallback projects:', this.projects);
  }

  calculateDuration(): void {
    const checkIn = this.attendanceForm.get('checkIn')?.value;
    const checkOut = this.attendanceForm.get('checkOut')?.value;
    if (checkIn && checkOut) {
      const [startHours, startMinutes] = checkIn.split(':').map(Number);
      const [endHours, endMinutes] = checkOut.split(':').map(Number);
      const start = new Date();
      const end = new Date();
      start.setHours(startHours, startMinutes);
      end.setHours(endHours, endMinutes);
      const diff = (end.getTime() - start.getTime()) / 1000 / 60;
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      this.duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      this.duration = '00:00';
    }
  }

  onSubmit(): void {
    if (this.attendanceForm.valid) {
      // Find the project by name to get the projectId
     
      const projectName = this.attendanceForm.get('project')?.value;
      const selectedProject = this.projects.find(p => p.name === projectName);
      
      const formValue = this.attendanceForm.value;
      const result = {
        ...formValue,
        projectId: selectedProject?.projectId || ''
      };
      const currentUserProfileRaw = localStorage.getItem('currentUserProfile');
      const currentUserProfile = JSON.parse(currentUserProfileRaw);
      let currentUserId = '';
      if (currentUserProfile.employeeID) {
        currentUserId = currentUserProfile.employeeID;
      }

      console.log('Date Arrange:', formValue.checkIn, formValue.checkOut, formValue.date);
      console.log('Project Name:', this.attendanceForm.get('project')?.value);
      console.log('Project ID:', selectedProject?.projectId);
      const attendance = {
        EmployeeId: currentUserId,
        projectId: selectedProject?.projectId || '',
        position: formValue.activity,
        description: formValue.description,
        AttendanceDate: formValue.date,
        Starttime: this.formatTime(formValue.checkIn, formValue.date),
        Endtime: this.formatTime(formValue.checkOut, formValue.date),
        Status: 'PENDING',

      }
      console.log('Attendance data post:', attendance);
      this.http.post(API_ENDPOINT.createAttendance, attendance).subscribe(response => {
        console.log('Attendance created:', response);
        this.toastService.success('Attendance saved successfully!');
        this.dialogRef.close(result);
      }, error => {
        console.error('Error creating attendance:', error);
        this.toastService.error('Failed to create attendance');
      });
    }
  }
 formatTime(timeStr: string, dateStr: string): string {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
  
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
  
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
  
    // Trả về dạng YYYY-MM-DDTHH:mm:ss (local time, không có Z)
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const ss = '00';
  
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
} 