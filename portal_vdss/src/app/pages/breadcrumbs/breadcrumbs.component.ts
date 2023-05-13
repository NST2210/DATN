import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HOME_PAGE } from 'src/app/common/enums/EApiUrl';
import { MenuModel } from 'src/app/common/model/MenuModel';
import { FetchApiService } from 'src/app/common/service/api/fetch-api.service';
import { LanguageCodeService } from 'src/app/common/service/language/language-code';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  @Input() groupName!: string;
  @Input() solutionName!: string;
  @Input() menuCode!: string;
  @Input() articleDetailId!: string;
  menus: Array<MenuModel> = [];
  items: any = [];
  portalCode: string = environment.portalCode;
  langCodeActive!: string;

  constructor(
    private router: Router,
    private api: FetchApiService,
    private lag: LanguageCodeService
  ) {
    // this.langCodeActive = this.lag.getLangCodeActive()
  }

  ngOnInit(): void {
    this.getMenus();
  }

  breadscrum() {
    if (this.router.url === '/home') {
      this.items = [{ label: 'Trang chủ', url: '/home' }];
    } else {
      this.menuNames(this.router.url);
    }
  }

  menuNames(url: string) {
    let newUrlIn = url.indexOf('?');
    const newUrl =
      newUrlIn === -1 ? this.router.url : this.router.url.slice(0, newUrlIn);

    let home = '';
    let homeLink = '';
    let neww = '';
    let newwLink = '';
    let sol = '';
    let solLink = '';
    this.menus.forEach((element) => {
      if (element.menuUrl === 'home') {
        home = element.menuName;
        homeLink = element.menuUrl;
        return;
      }
      if (element.menuUrl === 'news') {
        neww = element.menuName;
        newwLink = element.menuUrl;
        return;
      }
      if (element.menuUrl === 'group_solutions') {
        sol = element.menuName;
        solLink = element.menuUrl;
        return;
      }
    });
    if (newUrl.replace('/', '') === 'solution_detail') {
      this.items = [
        { label: home, url: homeLink },
        { label: sol, url: 'group_solutions?menuCode=' + this.menuCode },
        {
          label: this.groupName,
          url: 'group_solutions?menuCode=' + this.menuCode,
        },
      ];
    } else {
      if (newUrl.replace('/', '') === 'new_detail') {
        this.items = [
          { label: home, url: homeLink },
          { label: neww, url: newwLink },
        ];
      }
    }
  }

  //lay list menu

  getMenus() {
    this.api
      .get(HOME_PAGE.MENUS, {
        portalCode: this.portalCode,
        langCode: this.lag.getLangCodeActive(),
      })
      .subscribe({
        next: (rs: any) => {
          this.menus = rs['data'];
          this.breadscrum();
        },
        error: (error: any) => {},
      });
  }

  redirectPage(url: any) {
    window.location.href = '#/' + url;
  }
}
