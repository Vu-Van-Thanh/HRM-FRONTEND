import { Component, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Project } from '../../projects/project.model';
import { HttpClient } from '@angular/common/http';
import { ProjectService } from '../../projects/project.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import {ToastService} from 'angular-toastify';
@Component({
  selector: 'app-createtask',
  templateUrl: './createtask.component.html',
  styleUrls: ['./createtask.component.scss']
})

/**
 * Tasks-create component
 */
export class CreatetaskComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;

  // data
  Title : string;
  Description : string = '';
  StartDate : Date;
  EndDate : Date;
  Priority : string = '';
  Status : string = '';
  ProjectId : string = '';
  AssignedTo : string;
  Attachments : File[] = [];
  Projects: Project[] = [];
  selectedDepartmentId : string = '';
  public Editor = ClassicEditor;
  bsConfig = {
  dateInputFormat: 'DD/MM/YYYY',
  containerClass: 'theme-default',
  showWeekNumbers: false
};


  form = new UntypedFormGroup({
    member: new UntypedFormArray([
      new UntypedFormControl(''),
    ]),
  });

  hidden: boolean;
  selected: any;

  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  @ViewChild('dp', { static: true }) datePicker: any;

  /**
   * Returns the form field value
   */
  get member(): UntypedFormArray { return this.form.get('member') as UntypedFormArray; }

  /**
   * Add the member field in form
   */
  addMember() {
    this.member.push(new UntypedFormControl());
  }

  /**
   * Onclick delete member from form
   */
  deleteMember(i: number) {
    this.member.removeAt(i);
  }

  constructor(private http : HttpClient, private projectService : ProjectService, private toastService : ToastService) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Create Task', active: true }];
    this.loadProjects(); 
    this.hidden = true;
  }

  loadProjects() {

    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        console.log('Projects data:', data);
        this.Projects = data;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }
  onFileChange(event: any): void {
  const selectedFiles: FileList = event.target.files;
  if (selectedFiles) {
    for (let i = 0; i < selectedFiles.length; i++) {
      this.Attachments.push(selectedFiles.item(i)!);
    }
  }
}

  removeAttachment(index: number): void {
    this.Attachments.splice(index, 1);
  }

  onProjectChange(projectId: string) {
    const selectedProject = this.Projects.find(p => p.projectId === projectId);
    this.selectedDepartmentId = selectedProject ? selectedProject.departmentId : null;
    console.log('Selected DepartmentID:', this.selectedDepartmentId);
  }

  CreateTask(){
    const startDate = this.StartDate instanceof Date ? this.StartDate : new Date(this.StartDate);
    const endDate = this.EndDate instanceof Date ? this.EndDate : new Date(this.EndDate);
    const formData = new FormData();
    formData.append('Title', this.Title);
    formData.append('Description', this.Description);
    formData.append('StartDate', startDate.toISOString());
    formData.append('EndDate', endDate.toISOString());
    formData.append('Status', this.Status);
    formData.append('ProjectId', this.ProjectId);
    formData.append('AssignedTo', this.AssignedTo);
    formData.append('Priority', this.Priority);
    this.Attachments.forEach(file => {
      formData.append('Attachments', file, file.name);
    });

    this.http.post(API_ENDPOINT.createTask, formData).subscribe({
          next: (res) => {
            console.log('Upload thành công', res);
            this.toastService.success('Upload thành công');
          },
          error: (err) => {
            console.error('Lỗi upload', err);
            this.toastService.error('Lỗi upload');
          }
        });
  }

  onAssignedUserChanged(user: any) {
    console.log('User selected:', user);
    this.AssignedTo = user;
  }
  
}
