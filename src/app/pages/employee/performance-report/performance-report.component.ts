import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EvaluationCriteria,EvaluationEmployee } from '../performance-employee/performanceemployee.component';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import {ToastService} from 'angular-toastify';

@Component({
  selector: 'app-performance-report',
  templateUrl: './performance-report.component.html',
  styleUrls: ['./performance-report.component.scss']
})
export class PerformanceReportComponent {
  groupedCriterias: { [category: string]: EvaluationCriteria[] } = {};
  objectKeys = Object.keys;
  today: Date = new Date();

  constructor(
    private toastService: ToastService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<PerformanceReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { criterias: EvaluationCriteria[], evaluatorName: string, evaluation? :EvaluationEmployee  }
  ) {
    this.groupCriteriasByCategory();
  }

  groupCriteriasByCategory(): void {
    console.log ('Đang update bảng', this.data.evaluation);
    console.log('Criterias:', this.data.criterias);
    for (let c of this.data.criterias) {
      if (!this.groupedCriterias[c.category]) {
        this.groupedCriterias[c.category] = [];
      }
      this.groupedCriterias[c.category].push(c);
    }
  }
confirm(IsConfirm : boolean = false): void {
  const allCriterias = Object.values(this.groupedCriterias).flat();
  console.log('Criteria trước khi chuyển đổi : ', allCriterias);
  const detailJson: Record<string, number> = {};
  const detailJsonManager: Record<string, number> = {};

  for (const criterion of allCriterias) {
    if (criterion.criterionID) {
      if (criterion.selfScore != null) {
        detailJson[criterion.criterionID] = +criterion.selfScore;
      }
      if (criterion.managerScore != null) {
        detailJsonManager[criterion.criterionID] = +criterion.managerScore;
      }
    }
  }
  const body = {
    ID : this.data.evaluation?.id || null,
    EmployeeID : this.data.evaluation?.employeeID || null,
    EvaluatorId: this.data.evaluation?.evaluatorId || null,
    PeriodId : this.data.evaluation?.periodId || null,
    EvaluationDate : this.data.evaluation?.evaluationDate || new Date(),
    TotalScore : this.CalculateTotalScore(),
    DetailJson : JSON.stringify(detailJson),
    DetailJsonManager : JSON.stringify(detailJsonManager),
    Status : IsConfirm ? 'CONFIRMED' : 'DRAFT',
  }
  console.log('Score', this.CalculateTotalScore());
  this.http.put<string>(API_ENDPOINT.updateEvaluation, body).subscribe({
    next: (response) => { 
      this.toastService.success('Cập nhật đánh giá thành công!');
      this.dialogRef.close(true); 
    }
    , error: (error) => {
      this.toastService.error('Cập nhật đánh giá thất bại!');
      console.error('Lỗi khi cập nhật đánh giá:', error);
      this.dialogRef.close(false); 
    }
  });  

}

CalculateTotalScore(): number {
  console.log("Điểm sau khi nhập - từ grouped:", this.groupedCriterias);
  console.log("Điểm sau khi nhập - từ criterias:", this.data.criterias);
  const allCriterias = this.data.criterias; 
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const criterion of allCriterias) {
    if (criterion.managerScore != null && !isNaN(criterion.managerScore)) {
      const weight = criterion.weight || 0;
      totalWeightedScore += criterion.managerScore * weight;
      totalWeight += weight;
    }
  }

  const totalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  return +totalScore.toFixed(2); 
}


  close(): void {
    this.dialogRef.close();
  }
}
