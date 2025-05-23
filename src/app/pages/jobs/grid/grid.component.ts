import { Component, OnInit, ViewChild } from '@angular/core';
import { Job } from '../jobs.model';
import { JobGridService } from './grid.service';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  providers: [JobGridService, DecimalPipe]
})
export class GridComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  jobGrid!: Observable<Job[]>;
  total$: Observable<number>;
  jobGridList: any;
  alljobGridList: any;
  searchTerm: any;
  searchResults: any;
  type: any;
  date: any;
  page: any = 1;
  endItem: any = 10;
  jobGridForm!: UntypedFormGroup;
  submitted = false;
  modalRef: any;
  loading: boolean = false;
  error: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  jobs: Job[] = [];

  constructor(
    private service: JobGridService,
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient
  ) {
    this.jobGrid = service.jobGrid$;
    this.total$ = service.total$;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Jobs' },
      { label: 'Job Grid', active: true }
    ];

    this.jobGridForm = this.formBuilder.group({
      TenCV: ['', [Validators.required]],
      CongTy: ['', [Validators.required]],
      TinhThanh: ['', [Validators.required]],
      KinhNghiem: ['', [Validators.required]],
      CapBac: ['', [Validators.required]],
      LoaiHinh: ['', [Validators.required]]
    });

    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.error = '';

    const url = API_ENDPOINT.getAllJob
      .replace('{page}', this.currentPage.toString())
      .replace('{pageSize}', this.pageSize.toString());

    this.http.get<Job[]>(url).subscribe({
      next: (response) => {
        this.jobs = response;
        this.totalItems = response.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load jobs';
        this.loading = false;
      }
    });
  }

  openModal(content: any) {
    this.modalRef = this.modalService.open(content, { size: 'lg', centered: true });
  }

  saveUser() {
    if (this.jobGridForm.valid) {
      const formData = this.jobGridForm.value;
      // Handle form submission
      this.modalRef.close();
    }
  }

  editDataGet(content: any, id: any) {
    this.submitted = false;
    this.modalRef = this.modalService.open(content, { size: 'lg', centered: true });
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Job';
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    var listData = this.jobGridList.filter((data: { id: any; }) => data.id === id);
    this.jobGridForm.controls['TenCV'].setValue(listData[0].TenCV);
    this.jobGridForm.controls['CongTy'].setValue(listData[0].CongTy);
    this.jobGridForm.controls['TinhThanh'].setValue(listData[0].TinhThanh);
    this.jobGridForm.controls['KinhNghiem'].setValue(listData[0].KinhNghiem);
    this.jobGridForm.controls['CapBac'].setValue(listData[0].CapBac);
    this.jobGridForm.controls['LoaiHinh'].setValue(listData[0].LoaiHinh);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadJobs();
  }
}
