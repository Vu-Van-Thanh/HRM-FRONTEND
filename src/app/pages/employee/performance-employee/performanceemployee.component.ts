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
export interface EvaluationEmployee {
  id : string;
  evaluatorId : string;
  employeeID : string;
  evaluationDate : Date;
  periodId : string;
  totalScore : number;
  detailJson: string; 
  detailJsonManager: string; 
  periodName : string;
  employeeName: string;
  evaluatorName: string;
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
  user : any = null;
  selectedEmployee: any = null;
  employeesEvaluations: EvaluationEmployee[] = [];
  myEvaluations: EvaluationEmployee[] = [];
  displayedColumns: string[] = ['employeeID', 'evaluationDate', 'totalScore', 'periodName', 'evaluatorId', 'actions'];

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
    this.user = JSON.parse(localStorage.getItem('currentUserProfile'));
    this.managerId = this.user ? this.user.employeeID : null;
    this.loadPersonalEvaluation();
    this.loadManagerEvaluation();
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
  loadPersonalEvaluation(): void {
    this.http.get<any>(API_ENDPOINT.getAllEvaluationByEmployee.replace('{employeeId}', this.managerId || '')).subscribe({
      next: (data) => { 
        console.log('Đánh giá cá nhân:', data);
        this.myEvaluations = data;
        
      }
    });
  }

   loadManagerEvaluation(): void {
    this.http.get<any>(API_ENDPOINT.getAllEvaluationByManager.replace('{employeeId}', this.managerId || '')).subscribe({
      next: (data) => { 
        console.log('Đánh giá của quản lý:', data);
        this.employeesEvaluations = data;
        
      }
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
      criterias: this.selectedCriterias,
      evaluatorName: this.user.firstName + ' ' + this.user.lastName 
    }
  });
}
  saveEvaluationForm(): void {
    console.log('Đã chọn tiêu chí:', this.selectedCriterias);
    this.closeModal();
  }

editEvaluation(evaluation: EvaluationEmployee): void {
  if (!evaluation || !evaluation.detailJson) return;

  console.log('Chỉnh sửa đánh giá:', evaluation);

  const detailMapRaw: Record<string, number> = JSON.parse(evaluation.detailJson);

  // Convert keys to lowercase để tránh mismatch
  const detailMap: Record<string, number> = {};
  Object.keys(detailMapRaw).forEach(k => {
    detailMap[k.toLowerCase()] = detailMapRaw[k];
  });

  const mappedCriterias: EvaluationCriteria[] = this.allCriterias
    .filter(c => detailMap.hasOwnProperty(c.criterionID.toLowerCase()))
    .map(c => ({
      ...c,
      selfScore: detailMap[c.criterionID.toLowerCase()],
      managerScore: detailMap[c.criterionID.toLowerCase()]
    }));

  console.log('Mapped Criterias:', mappedCriterias);

  this.dialog.open(PerformanceReportComponent, {
    width: '700px',
    data: { 
      criterias: mappedCriterias,
      evaluatorName: evaluation.evaluatorName,
      evaluation : evaluation }
  });
}


deleteEvaluation(evaluation: EvaluationEmployee): void {
  console.log('Xóa đánh giá:', evaluation);
  // TODO: xác nhận rồi gọi API xóa nếu cần
}

}
