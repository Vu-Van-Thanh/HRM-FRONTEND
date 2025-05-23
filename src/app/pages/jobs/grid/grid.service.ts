/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {Injectable, PipeTransform} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import { Job, JobResponse } from '../jobs.model';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import {SortColumn, SortDirection} from './grid-sortable.directive';

interface SearchResult {
  jobGrid: Job[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
  type: string;
  date: string;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(jobGrid: Job[], column: SortColumn, direction: string): Job[] {
  if (direction === '' || column === '') {
    return jobGrid;
  } else {
    return [...jobGrid].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(job: Job, term: string, pipe: PipeTransform) {
  return job.TenCV.toLowerCase().includes(term.toLowerCase())
    || job.CongTy.toLowerCase().includes(term.toLowerCase())
    || job.TinhThanh.toLowerCase().includes(term.toLowerCase())
    || job.KinhNghiem.toLowerCase().includes(term.toLowerCase())
    || job.LoaiHinh.toLowerCase().includes(term.toLowerCase())
    || job.Nganh.toLowerCase().includes(term.toLowerCase());
}

@Injectable({providedIn: 'root'})
export class JobGridService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _jobGrid$ = new BehaviorSubject<Job[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  content?: any;
  products?: any;

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0,
    type: '',
    date: '',
  };

  constructor(private pipe: DecimalPipe) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._jobGrid$.next(result.jobGrid);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  get jobGrid$() { return this._jobGrid$.asObservable(); }
  get product() { return this.products; }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }
  get startIndex() { return this._state.startIndex; }
  get endIndex() { return this._state.endIndex; }
  get totalRecords() { return this._state.totalRecords; }
  get type() { return this._state.type; }
  get date() { return this._state.date; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set startIndex(startIndex: number) { this._set({startIndex}); }
  set endIndex(endIndex: number) { this._set({endIndex}); }
  set totalRecords(totalRecords: number) { this._set({totalRecords}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }
  set type(type: string) { this._set({type}); }
  set date(date: string) { this._set({date}); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm, type, date} = this._state;

    // 1. sort
    let jobGrid = sort([], sortColumn, sortDirection);    

    // 2. filter
    jobGrid = jobGrid.filter(job => matches(job, searchTerm, this.pipe));  

    // 3. Type Filter
    if(type){
      jobGrid = jobGrid.filter(job => job.LoaiHinh == type);
    }
    else{
      jobGrid = jobGrid;
    }

    const total = jobGrid.length;

    // 4. paginate
    this.totalRecords = jobGrid.length;
    this._state.startIndex = (page - 1) * this.pageSize + 1;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
    }
    jobGrid = jobGrid.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({jobGrid, total});
  }
}
