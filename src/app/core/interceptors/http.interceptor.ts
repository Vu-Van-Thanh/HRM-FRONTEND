import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor as HttpSystemInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpResponse } from '@angular/common/http';
import { ToastService } from 'angular-toastify';

import { Header, HttpError } from '../enums/http.enum';
import { LoaderService } from '../services/loader.service';
import { AuthenticationService } from '../services/auth.service';
import { MockService } from '../services/mock.service';

@Injectable()
export class HttpInterceptor implements HttpSystemInterceptor {
  constructor(
    private loadingService: LoaderService, 
    private toastService: ToastService, 
    private authService: AuthenticationService,
    private mockService: MockService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Set default baseurl
    if (!request.url.startsWith('http') && !request.url.startsWith('https')) {
      request = request.clone({ url: `${environment.apiBaseUrl}${request.url}` });
    }

    // Loading when call request
    if (!request.headers.has(Header.SkipLoading)) {
      this.loadingService.show();
    } else {
      request = request.clone({
        headers: request.headers.delete(Header.SkipLoading)
      });
    }

    // Set token header
    const authToken = this.authService.getAuthToken();
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        }
      });
    }

    // Mock service handling
    const url = request.url.toLowerCase();
    
    // Mock config API
    if (url.includes('/api/config/get-config-by-key')) {
      return of(
        new HttpResponse({
          body: {
            isSuccess: true,
            data: 'DB', // Default auth mode
          },
          status: 200, // HTTP 200 OK
        })
      ).pipe(finalize(() => this.loadingService.hide()));
    }

    

    
    return next.handle(request).pipe(
      catchError((error: any) => {
        // Handle case errors
        if (error.status === HttpError.ConnectionRefused) {
          this.toastService.error('Không thể kết nối đến máy chủ!');
        }

        return throwError(error);
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}
