import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-performance-employee',
  templateUrl: './performanceemployee.component.html',
})
export class   implements OnInit {
  form: FormGroup;
  isEditMode = false;
  criterionId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      weight: [1, [Validators.required, Validators.min(1)]],
      category: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const data = this.form.value;
    if (this.isEditMode && this.criterionId) {
      this.http.put(`/api/evaluationcriterias/${this.criterionId}`, data)
        .subscribe(() => alert('Updated successfully'));
    } else {
      this.http.post('/api/evaluationcriterias', data)
        .subscribe(() => {
          alert('Created successfully');
          this.form.reset({ weight: 1 });
        });
    }
  }
}
