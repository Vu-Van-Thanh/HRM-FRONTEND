import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth.service';

import { ConfigService } from '../services/config.service';
import { AUTH_MODE } from '../constants/config-values.constant';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private configService: ConfigService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    const currentUser = this.authenticationService.GetCurrentUser();

      // Refresh user info if current user is null
      if (!currentUser) {
        return this.authenticationService.GetUserProfile().pipe(
          map((response: any) => {
            console.log(response)
            if (response?.isSuccess) {
              this.authenticationService.SetCurrentUser(response?.data);
              return true;
            } else {
              this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
              return false; 
            }
          }),
          catchError(() => {
            this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
          })
        );
      }

      return of(true);
  }
}

/*import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';

import { AuthenticationService } from '../services/auth.service';

import { ConfigService } from '../services/config.service';
import { MockService } from '../services/mock.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private configService: ConfigService,
    private mockService: MockService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Luôn cho phép truy cập
    return of(true);
  }
}
*/