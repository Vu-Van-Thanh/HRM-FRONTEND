import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { environment } from '../environments/environment';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { CarouselModule } from 'ngx-owl-carousel-o';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

import { SharedModule } from './cyptolanding/shared/shared.module';

import { ExtrapagesModule } from './extrapages/extrapages.module';

import { LayoutModule } from './layouts/layout.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CyptolandingComponent } from './cyptolanding/cyptolanding.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HttpInterceptor } from './core/interceptors/http.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { AngularToastifyModule } from 'angular-toastify';
import { appInitializerFactory } from './core/initializers/app.initializers';
import { ConfigService } from './core/services/config.service';

import { AttendanceModule } from './pages/attendance/attendance.module';

// Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, environment.externalService.translateServiceUrl, '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CyptolandingComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    LayoutModule,
    AppRoutingModule,
    ExtrapagesModule,
    CarouselModule,
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    SharedModule,
    ScrollToModule.forRoot(),
    ToastrModule.forRoot(),
    AngularToastifyModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Feature Modules
    AttendanceModule,
    
    // Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatChipsModule,
    MatCardModule
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptor, multi: true }
    /*{ provide: APP_INITIALIZER, useFactory: appInitializerFactory, deps: [ConfigService], multi: true}*/
  ],
})
export class AppModule { }
