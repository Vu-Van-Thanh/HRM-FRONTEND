import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, EventEmitter, ViewChild, Output } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { Department } from '../../../system/department/department.model';
import { DepartmentService } from '../../../system/department/department.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

/**
 * Projects-create component
 */
export class CreateComponent implements OnInit {

  constructor(private cd: ChangeDetectorRef, private http: HttpClient, 
    private departmentService: DepartmentService,
    private toastService: ToastService
  ) { }
  // bread crumb items
  breadCrumbItems: Array<{}>;
  Departments : Department[];
  Name : string;
  Description : string;
  StartDate : Date;
  EndDate : Date;
  Status : string;
  Visibility : string;
  Members : string;
  ProjectManager : string;
  ProjectAttachment : File[] = [];
  logoFile : File | null = null;
  DepartmentId : string;
  
  selected: any;
  hidden: boolean;
  files: File[] = [];
  
  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  @ViewChild('dp', { static: true }) datePicker: any;

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Create New', active: true }];
    this.loadDepartments();
    this.selected = '';
    this.hidden = true;
  }
  loadDepartments(): void {
    
    
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.Departments = data;
       
      },
      error: (error) => {
       
        console.error('Error loading departments:', error);
      }
    });
  }
    // File Upload
    imageURL: any;
    
  onSelect(event: any) {
  for (const file of event.addedFiles) {
    this.ProjectAttachment.push(file);
  }
  
  setTimeout(() => {
    this.cd.detectChanges(); // đợi 1 nhịp rồi mới check lại
  });
}

onRemove(file: File) {
  this.ProjectAttachment = this.ProjectAttachment.filter(f => f !== file);
}

getPreview(file: File): string {
  return URL.createObjectURL(file);
}

  CreateProject() {
    const startDate = this.StartDate instanceof Date ? this.StartDate : new Date(this.StartDate);
    const endDate = this.EndDate instanceof Date ? this.EndDate : new Date(this.EndDate);
    const formData = new FormData();
    formData.append('Name', this.Name);
    formData.append('Description', this.Description);
    formData.append('StartDate', startDate.toISOString());
    formData.append('EndDate', endDate.toISOString());
    formData.append('Status', this.Status);
    formData.append('Visibility', this.Visibility);
    formData.append('Members', this.Members);
    formData.append('ProjectManager', this.ProjectManager);
    formData.append('DepartmentId', this.DepartmentId);
    if (this.logoFile) {
      const extension = this.logoFile.name.substring(this.logoFile.name.lastIndexOf('.'));
      formData.append('ProjectAttachment', this.logoFile, `logo${extension}`);
    }
    this.ProjectAttachment.forEach(file => {
      formData.append('ProjectAttachment', file, file.name);
    });

    // Gửi request
    this.http.post(API_ENDPOINT.createProject, formData).subscribe({
      next: (res) => {
        console.log('Upload thành công', res);
        this.toastService.success('Upload thành công');
      },
      error: (err) => {
        console.error('Lỗi upload', err);
        this.toastService.error('Lỗi upload');
      }
    });

    // append các trường khác tương tự

   
  }

  onFileSelected(event: Event) {
    console.log('onFileSelected', event);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.logoFile = file;
        setTimeout(() => {
          this.imageURL = URL.createObjectURL(file);
        });
      }
    }
  }
}
