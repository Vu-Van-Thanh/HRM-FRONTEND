import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

import Swal from 'sweetalert2';

import { jobListModel } from './list.model';
import { JobListService } from './list.service';
import { NgbdJobListSortableHeader, SortEvent } from './list-sortable.directive';
import { JobListdata } from './data';
import { Job, JobResponse } from '../jobs.model';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [JobListService, DecimalPipe]
})

/**
 * List Component
 */
export class ListComponent implements OnInit {

  modalRef?: BsModalRef;

  // bread crumb items
  breadCrumbItems: Array<{}>;
  jobListForm!: UntypedFormGroup;
  submitted: boolean = false;

  // Table data
  content?: any;
  lists?: any;
  jobList!: Observable<jobListModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdJobListSortableHeader) headers!: QueryList<NgbdJobListSortableHeader>;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  jobs: Job[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private modalService: BsModalService, public service: JobListService, private formBuilder: UntypedFormBuilder, private http: HttpClient) {
    this.jobList = service.jobList$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Tuyển dụng' }, { label: 'Danh sách việc làm', active: true }];
    this.loadJobs();

    /**
     * Form Validation
     */
    this.jobListForm = this.formBuilder.group({
      id: "11",
      ids: [''],
      title: ['', [Validators.required]],
      name: ['', [Validators.required]],
      location: ['', [Validators.required]],
      experience: ['', [Validators.required]],
      position: ['', [Validators.required]],
      type: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    /**
    * fetches data
    */
    this.jobList.subscribe(x => {
      this.content = this.lists;
      this.lists = Object.assign([], x);
    });
  }

  loadJobs() {
    this.loading = true;
    const params = new HttpParams()
      .set('page', this.currentPage)
      .set('pageSize', this.pageSize);

    this.http.get<Job[]>(API_ENDPOINT.getAllJob, { params }).subscribe({
      next: (response) => {
        this.jobs = response;
        this.totalItems = response.length;
        this.totalPages = Math.ceil(response.length / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách việc làm';
        this.loading = false;
        console.error('Error loading jobs:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  openJobLink(link: string) {
    window.open(link, '_blank');
  }

  /**
  * Open modal
  * @param content modal content
  */
  openViewModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.lists.forEach((x: { state: any; }) => x.state = ev.target.checked)
  }

  // Delete Data
  delete(event: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
          event.target.closest('tr')?.remove();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
      });
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }

  /**
   * Form data get
   */
  get form() {
    return this.jobListForm.controls;
  }

  /**
  * Save user
  */
  saveUser() {
    if (this.jobListForm.valid) {
      if (this.jobListForm.get('ids')?.value) {
        this.service.products = JobListdata.map((data: { id: any; }) => data.id === this.jobListForm.get('ids')?.value ? { ...data, ...this.jobListForm.value } : data)
      } else {
        const title = this.jobListForm.get('title')?.value;
        const name = this.jobListForm.get('name')?.value;
        const location = this.jobListForm.get('location')?.value;
        const experience = this.jobListForm.get('experience')?.value;
        const position = this.jobListForm.get('position')?.value;
        const type = this.jobListForm.get('type')?.value;
        const posted_date = "02 June 2021";
        const last_date = "25 June 2021";
        const status = this.jobListForm.get('status')?.value;
        JobListdata.push({
          id: this.lists.length + 1,
          title,
          name,
          location,
          experience,
          position,
          type,
          type_color: "success",
          posted_date,
          last_date,
          status,
          status_color: "success"
        });
      }
    }
    this.modalService.hide();
    setTimeout(() => {
      this.jobListForm.reset();
    }, 2000);
    this.submitted = true
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
  editDataGet(id: any, content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Order';
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    var listData = this.lists.filter((data: { id: any; }) => data.id === id);
    this.jobListForm.controls['title'].setValue(listData[0].title);
    this.jobListForm.controls['name'].setValue(listData[0].name);
    this.jobListForm.controls['location'].setValue(listData[0].location);
    this.jobListForm.controls['experience'].setValue(listData[0].experience);
    this.jobListForm.controls['position'].setValue(listData[0].position);
    this.jobListForm.controls['type'].setValue(listData[0].type);
    this.jobListForm.controls['status'].setValue(listData[0].status);
    this.jobListForm.controls['ids'].setValue(listData[0].id);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadJobs();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadJobs();
  }

}
