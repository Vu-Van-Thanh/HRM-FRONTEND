import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import {ToastService} from 'angular-toastify'

@Component({
  selector: 'app-createcriteria',
  templateUrl: './createcriteria.component.html'
})
export class CreateCriteriaComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  criterionId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient,private toast: ToastService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      weight: [1, [Validators.required]],
      category: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const body = {
      Name: this.form.value.name,
      Description: this.form.value.description,
      Weight: this.form.value.weight,
      Category: this.form.value.category
    }

    this.http.post<any>(API_ENDPOINT.addCriterias, body).subscribe({
      next: (response) => { 
        this.form.reset();
        this.toast.success('Criteria created successfully');
      },
      error: (error) => {
        this.toast.error('Failed to create criteria');
      }
    });
  }
}
