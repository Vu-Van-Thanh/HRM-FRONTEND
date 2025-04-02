import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-relative-dialog',
  template: `
    <h2 mat-dialog-title>{{data.relative ? 'Chỉnh sửa' : 'Thêm'}} người thân</h2>
    <form [formGroup]="relativeForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Họ và tên</mat-label>
            <input matInput formControlName="name" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Quan hệ</mat-label>
            <mat-select formControlName="relationship" required>
              <mat-option *ngFor="let relation of relationships" [value]="relation">
                {{relation}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Số điện thoại</mat-label>
            <input matInput formControlName="phone" required>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Hủy</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!relativeForm.valid">
          {{data.relative ? 'Cập nhật' : 'Thêm'}}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class RelativeDialogComponent implements OnInit {
  relativeForm: FormGroup;
  relationships = ['Vợ/Chồng', 'Cha', 'Mẹ', 'Con', 'Anh/Chị', 'Em', 'Khác'];

  constructor(
    private dialogRef: MatDialogRef<RelativeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employeeId: string, relative?: any },
    private fb: FormBuilder
  ) {
    this.relativeForm = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data.relative) {
      this.relativeForm.patchValue(this.data.relative);
    }
  }

  onSubmit() {
    if (this.relativeForm.valid) {
      this.dialogRef.close(this.relativeForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 