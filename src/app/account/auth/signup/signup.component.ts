import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../core/services/auth.service';
import { first } from 'rxjs/operators';
import { UserProfileService } from '../../../core/services/user.service';
import {User} from '../../../core/models/auth.models';
import { ToastService } from 'angular-toastify';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm: UntypedFormGroup;
  submitted:any = false;
  error:any = '';
  successmsg:any = false;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private userService: UserProfileService,private toastService: ToastService) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role:['',Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    } else {
      const payload: User = {
        Fullname: this.f.username.value,
        Email: this.f.email.value,
        Password: this.f.password.value,
        ConfirmPassword: this.f.password.value,
        Role: this.f.role.value,
      };
      this.userService.register(payload)
          .pipe(first())
          .subscribe(
            data => {
              this.successmsg = true;
              if (this.successmsg) {
                this.toastService.success('Đăng ký tài khoản thành công');
                this.router.navigate(['/account/login'], {
                  state: {
                    username: this.f.email.value,
                    password: this.f.password.value
                  }});
              }
            },
            error => {
              this.error = error ? error : '';
            });
    }
  }
}
