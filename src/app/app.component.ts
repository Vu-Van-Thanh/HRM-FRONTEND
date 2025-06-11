import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('vi');
    translate.use('vi');
  }

  ngOnInit() {
    this.setPageTitle();
  }

  private setPageTitle() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child && child.firstChild) {
          child = child.firstChild;
        }
        return child?.snapshot.data['title'] || 'HRMTV-Phần mềm quản lý nhân sự';
      })
    ).subscribe((title: string) => {
      this.titleService.setTitle(title);
    });
  }
}
