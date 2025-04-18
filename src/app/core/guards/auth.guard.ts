import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth.service';

import { ConfigService } from '../services/config.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private configService: ConfigService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const currentUser = this.authenticationService.GetCurrentUser();
    const currentUserProfile = this.authenticationService.GetCurrentUserProfile();  
    console.log("User hiện tại : ", currentUser);
    console.log("Profile hiện tại : ", currentUserProfile);
    // Nếu chưa login
    if (!currentUser) {
      this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    }

    if (currentUserProfile === undefined || currentUserProfile === null) {
      try {
        return this.authenticationService.GetUserProfile(currentUser.AccountId).pipe(
          map((response: any) => {
            this.authenticationService.SetCurrentUserProfile(response);
            return true; 
          }),
          catchError((error) => {
            console.error('Lỗi khi lấy profile:', error); 
            return of(true); 
          })
        );
      } catch (error) {
        console.error('Đã xảy ra lỗi:', error);
        return of(true); 
      }
    }
  
    return of(true);  
  }
  
  
}
