import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { InternalInfo } from '../models/internal-info.model';
import { InternalInfoService } from '../services/internal-info.service';
import { InternalInfoFormDialogComponent } from '../internal-info-form-dialog/internal-info-form-dialog.component';
import { WordDocumentDialogComponent } from '../word-document-dialog/word-document-dialog.component';
import { DepartmentService } from 'src/app/system/department/department.service';
import { Department } from 'src/app/system/department/department.model';

@Component({
  selector: 'app-internal-info-list',
  templateUrl: './internal-info-list.component.html',
  //styleUrls: ['./internal-info-list.component.scss']
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
  departments: Department[] = [];
  departmentMap: Map<string, string> = new Map(); // Map from departmentId to name
  selectedDepartment: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private internalInfoService: InternalInfoService,
    private departmentService: DepartmentService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadInternalInfos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        
        // Create a mapping from department ID to department name
        this.departments.forEach(dept => {
          if (dept.code) {
            this.departmentMap.set(dept.code, dept.name || 'Unknown');
          }
        });
        
        console.log('✅ Department mapping:', this.departmentMap);
      },
      error: (error) => {
        console.error('❌ Error loading departments:', error);
      }
    });
  }

  loadInternalInfos(): void {
    const params: any = {};
    if (this.selectedDepartment) {
      params.DepartmentId = this.selectedDepartment;
    }

    this.internalInfoService.getInternalInfos(params).subscribe({
      next: (infos) => {
        // Map department IDs to names
        const mappedInfos = infos.map(info => {
          return {
            ...info,
            departmentName: this.getDepartmentName(info.departmentId)
          };
        });
        
        this.dataSource.data = mappedInfos;
      },
      error: (error) => {
        console.error('Error loading internal infos:', error);
      }
    });
  }

  // Helper function to get department name from ID
  getDepartmentName(departmentId: any): string {
    if (!departmentId) return 'N/A';
    
    const deptIdStr = departmentId.toString();
    return this.departmentMap.get(deptIdStr) || 'Unknown';
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
      data: { 
        isEdit: false,
        departments: this.departments
      }
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
        isEdit: true,
        departments: this.departments
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

  onPreviewContent(info: InternalInfo): void {
    // Use the same dialog component but with content instead of documentId
    const previewInfo = {
      ...info,
      documentId: 'preview-content' // Dummy ID to avoid alert
    };
    
    const dialogRef = this.dialog.open(WordDocumentDialogComponent, {
      width: '900px',
      height: '80vh',
      data: { 
        info: previewInfo,
        isContentPreview: true,
        htmlContent: info.content
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  }
} 