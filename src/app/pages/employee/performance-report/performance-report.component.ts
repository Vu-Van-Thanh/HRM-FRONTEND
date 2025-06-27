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
    @Inject(MAT_DIALOG_DATA) public data: { criterias: EvaluationCriteria[] }
  ) {
    this.groupCriteriasByCategory();
  }

  groupCriteriasByCategory(): void {
    for (let c of this.data.criterias) {
      if (!this.groupedCriterias[c.category]) {
        this.groupedCriterias[c.category] = [];
      }
      this.groupedCriterias[c.category].push(c);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
