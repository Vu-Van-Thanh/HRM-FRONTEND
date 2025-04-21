import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { ToastService } from 'angular-toastify';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AUTH_MODE } from 'src/app/core/constants/config-values.constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted:any = false;
  error:any = '';
  returnUrl: string;
  passwordFieldType: string = 'password';

  authMode: string = AUTH_MODE.DB;

  // Set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router, 
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) { }

  ngOnInit() {

      const state = history.state;

      this.loginForm = this.formBuilder.group({
        userName: [state?.username ?? 'admin@gmail.com', [Validators.required]],
        password: [state?.password ?? 'Thanh2k3!', [Validators.required]],
        rememberMe: [true]
      });

  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    /*this.router.navigate(['/dashboard']);*/
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } 
    
    var isRemember = this.f.rememberMe.value;
    console.log('Login request with:', {
      userName: this.f.userName.value,
      password: this.f.password.value,
      isRemember
    });

    this.authenticationService.login(this.f.userName.value, this.f.password.value,isRemember)
      .subscribe({
        next: (response: any) => {
          console.log('Login response:', response);
          if(response?.isSuccess){
            const accessToken = response?.accessToken;
            const refresh_token = response?.refresh_token;
            const user = response?.user;
            this.authenticationService.setAuthToken({ accessToken,refresh_token },isRemember);
            console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUU: ", this.authenticationService.GetCurrentUser());
            this.authenticationService.SetCurrentUser(user);
            //localStorage.setItem('currentUser', JSON.stringify(user));
            this.toastService.success('Đăng nhập thành công!');
            console.log("redirect /dashboard");
            this.router.navigate(['/dashboard']);
          } else {
            this.toastService.error(response?.message || 'Đăng nhập thất bại!');
          }
        },
        error: (error: any) => {
          console.error('Login error:', error);
          this.toastService.error(error?.error?.message || 'Có lỗi xảy ra khi đăng nhập!');
        }
      });
  }

  // UI
  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
