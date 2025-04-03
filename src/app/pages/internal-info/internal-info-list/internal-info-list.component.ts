import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { InternalInfo } from '../models/internal-info.model';
import { InternalInfoService } from '../services/internal-info.service';
import { InternalInfoFormDialogComponent } from '../internal-info-form-dialog/internal-info-form-dialog.component';
import { WordDocumentDialogComponent } from '../word-document-dialog/word-document-dialog.component';

@Component({
  selector: 'app-internal-info-list',
  templateUrl: './internal-info-list.component.html',
  styleUrls: ['./internal-info-list.component.scss']
})
export class InternalInfoListComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'departmentName',
    'createdByName',
    'createdAt',
    'actions'
  ];
  dataSource: MatTableDataSource<InternalInfo> = new MatTableDataSource<InternalInfo>([]);
  departments: string[] = [];
  selectedDepartment: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private internalInfoService: InternalInfoService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadInternalInfos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInternalInfos(): void {
    const params: any = {};
    if (this.selectedDepartment) {
      params.department = this.selectedDepartment;
    }

    this.internalInfoService.getInternalInfos(params).subscribe({
      next: (infos) => {
        this.dataSource.data = infos;
        // Extract unique departments from infos
        this.departments = this.internalInfoService.getDepartments();
      },
      error: (error) => {
        console.error('Error loading internal infos:', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onFilterChange(): void {
    this.loadInternalInfos();
  }

  onAddNew(): void {
    const dialogRef = this.dialog.open(InternalInfoFormDialogComponent, {
      width: '800px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInternalInfos();
      }
    });
  }

  onEdit(info: InternalInfo): void {
    const dialogRef = this.dialog.open(InternalInfoFormDialogComponent, {
      width: '800px',
      data: { 
        info,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInternalInfos();
      }
    });
  }

  onDelete(info: InternalInfo): void {
    if (confirm('Bạn có chắc chắn muốn xóa thông tin này?')) {
      this.internalInfoService.deleteInternalInfo(info.id).subscribe({
        next: () => {
          this.loadInternalInfos();
        },
        error: (error) => {
          console.error('Error deleting internal info:', error);
        }
      });
    }
  }

  onViewDocument(info: InternalInfo): void {
    if (info.documentId) {
      this.dialog.open(WordDocumentDialogComponent, {
        width: '900px',
        height: '80vh',
        data: { info }
      });
    } else {
      alert('Không có tài liệu Word nào được đính kèm.');
    }
  }
} 