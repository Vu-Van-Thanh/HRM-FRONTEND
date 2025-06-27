import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { PerformanceReportComponent } from '../performance-report/performance-report.component';
export interface EvaluationPeriod {
  periodID: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface EvaluationCriteria {
  criterionID: string;
  name: string;
  description: string;
  weight: number;
  category: string;
  selfScore?: number; // điểm tự chấm
  managerScore?: number; // điểm quản lý chấm
}

@Component({
  selector: 'app-performance-employee',
  templateUrl: './performanceemployee.component.html',
  styleUrls: ['./performanceemployee.component.scss'],
})
export class PerformanceEmployee implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  employees: any[] = []; 
  selectedEmployee: any = null;
  selectedTabIndex = 0;
  managerId : string | null = null;
  evaluationPeriods: EvaluationPeriod[] = [];

  selectedPeriodAll: string | null = null;
  selectedPeriodMine: string | null = null;

  allCriterias: EvaluationCriteria[] = [];
  selectedCriterias: EvaluationCriteria[] = [];
  criteriaSearch: string = '';

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPeriod();
    this.loadCriterias();
    this.loadEmployees();
    const user = JSON.parse(localStorage.getItem('currentUserProfile'));
    this.managerId = user ? user.employeeID : null;
  }

  loadEmployees(): void {
    const param = new HttpParams()
        .set('ManagerId', this.managerId || '')
      console.log('Loading employees with params:', param.toString());
      this.http.get<any[]>(`${API_ENDPOINT.getEmployeeByFilter2}`, { params: param }).subscribe({
        
        next: (data) => {
          this.employees = data;
          console.log('Loaded employees:', this.employees);
        },
        error: (err) => console.error(err)

      });
    
  }
  openModal(): void {
    this.criteriaSearch = '';
    this.selectedCriterias = [];
    this.dialog.open(this.dialogTemplate, {
      width: '600px'
    });
  }

  closeModal(): void {
    this.dialog.closeAll();
  }

  loadPeriod(): void {
    this.http.get<EvaluationPeriod[]>(API_ENDPOINT.loadAllPeriod).subscribe({
      next: (data) => (this.evaluationPeriods = data)
    });
  }

  loadCriterias(): void {
    this.http.get<EvaluationCriteria[]>(API_ENDPOINT.loadAllCriterias).subscribe({
      next: (data) => (this.allCriterias = data)
    });
  }

  SendReport(): void{
    const scoreMap: Record<string, number> = {};
    this.selectedCriterias.forEach(c => {
      scoreMap[c.criterionID] = 0; // hoặc null nếu bạn muốn để trống
    });
    const detailJson = JSON.stringify(scoreMap);
    console.log('Chi tiết điểm:', scoreMap, detailJson);
    const body = {
      EmployeeID: this.selectedEmployee,
      EvaluatorId: this.managerId,
      PeriodId : this.selectedPeriodAll,
      EvaluationDate : new Date(),
      TotalScore : 0,
      DetailJson: detailJson
    };
    console.log('Gửi đánh giá với dữ liệu:', body);
    this.http.post(API_ENDPOINT.addEvaluationEmployee, body).subscribe({
      next: (response) => {
        console.log('Đánh giá đã được gửi thành công:', response);
        this.closeModal();
      }
      , error: (error) => {
        console.error('Lỗi khi gửi đánh giá:', error);
      }
    });
  }
  filteredCriterias(): EvaluationCriteria[] {
    return this.allCriterias.filter(c =>
      c.name.toLowerCase().includes(this.criteriaSearch.toLowerCase())
    );
  }

  addCriterion(c: EvaluationCriteria): void {
    if (!this.selectedCriterias.some(x => x.criterionID === c.criterionID)) {
      this.selectedCriterias.push(c);
    }
  }

  removeCriterion(id: string): void {
    this.selectedCriterias = this.selectedCriterias.filter(c => c.criterionID !== id);
  }

  previewEvaluationReport() {
  this.dialog.open(PerformanceReportComponent, {
    width: '700px',
    data: {
      criterias: this.selectedCriterias
    }
  });
}
  saveEvaluationForm(): void {
    console.log('Đã chọn tiêu chí:', this.selectedCriterias);
    this.closeModal();
  }
}
