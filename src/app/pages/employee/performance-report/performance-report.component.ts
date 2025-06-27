import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EvaluationCriteria } from '../performance-employee/performanceemployee.component';

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
    public dialogRef: MatDialogRef<PerformanceReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { criterias: EvaluationCriteria[], evaluatorName: string  }
  ) {
    this.groupCriteriasByCategory();
  }

  groupCriteriasByCategory(): void {
    console.log('Criterias:', this.data.criterias);
    for (let c of this.data.criterias) {
      if (!this.groupedCriterias[c.category]) {
        this.groupedCriterias[c.category] = [];
      }
      this.groupedCriterias[c.category].push(c);
    }
  }
confirm(): void {
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

  console.log('Detail JSON:', detailJson);
  console.log('Detail JSON Manager:', detailJsonManager);

}


  close(): void {
    this.dialogRef.close();
  }
}
