import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './changepassword.component.html'
})
export class ChangepasswordComponent {
  changePasswordForm!: FormGroup;
  submitted = false;
  error: string | null = null;
  year = new Date().getFullYear();

  passwordFieldType = {
    old: 'password',
    new: 'password',
    confirm: 'password'
  };

  constructor(private fb: FormBuilder,private http: HttpClient, private authService: AuthenticationService) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
    
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  togglePasswordVisibility(field: 'old' | 'new' | 'confirm') {
    this.passwordFieldType[field] = this.passwordFieldType[field] === 'password' ? 'text' : 'password';
  }

  checkPasswords(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : group.get('confirmPassword')?.setErrors({ mismatch: true });
  }

  onSubmit() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) return;

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    const body  : any = {
      CurrentPassword : oldPassword, 
      NewPassword : newPassword,
      ConfirmPassword : newPassword
    };
    return this.authService.changepassword(body);

  }
}
