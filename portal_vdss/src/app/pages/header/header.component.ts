import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { LanguageCodeService } from '../../common/service/language/language-code';
import { HOME_PAGE } from '../../common/enums/EApiUrl';
import { MenuModel } from '../../common/model/MenuModel';
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import * as $ from 'jquery';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() menus: Array<MenuModel> = [];

  listLangCode!: any[];
  langCodeSelect!: any;
  portalCode: string = environment.portalCode;
  langCodeActive!: string;
  logo!: any;
  logoObject!: { logo: any; logoScroll: any };

  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    private router: Router,
    public lag: LangAppService
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (
          event.url.indexOf('/new_detail') >= 0 ||
          event.url.indexOf('/solution_detail') >= 0
        )
          this.logo = this.logoObject.logo;
      }
    });
    // this.langCodeActive = this.lag.getLangCodeActive();
  }

  ngOnInit(): void {
    this.getAllLangPortal();
    this.getDataFooter();
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    const nav = document.getElementById('mainNav');
    if (window.pageYOffset > 60) {
      nav?.classList.add('scrolled');
      this.logo = this.logoObject.logoScroll;
    } else {
      this.logo = this.logoObject.logo;
      nav?.classList.remove('scrolled');
    }
    if (
      this.router.url.indexOf('/solution_detail') >= 0 ||
      this.router.url.indexOf('/new_detail') >= 0
    ) {
      this.logo = this.logoObject.logoScroll;
      nav?.classList.remove('scrolled');
      nav?.classList.add('scrolled');
    }
  }

  //=== get all Portal Lang
  getAllLangPortal() {
    let param = {
      portalCode: this.portalCode,
      // langCurrent: this.langCodeActive
      langCurrent: '',
      //langCurrent: this.langCodeService.langCode
    };
    this.api.get(HOME_PAGE.LANG_ALL, param).subscribe({
      next: (res) => {
        this.listLangCode = res.data;
        this.langCodeSelect = this.listLangCode.filter(
          (x) => x.langCode === this.langCodeService.getLangCodeActive()
        )[0];
        // this.langCodeSelect = this.listLangCode[0];
      },
      error: (error) => {
        console.log('error', error);
      },
    });
  }

  getDataFooter() {
    this.api
      .get(HOME_PAGE.FOOTER_DATA, {
        portalCode: this.portalCode,
        portalLang: this.langCodeService.getLangCodeActive(),
      })
      .subscribe({
        next: (rs: any) => {
          this.logoObject = {
            logo: rs['data'].logo,
            logoScroll: rs['data'].logoScroll,
          };
          this.logo = this.logoObject.logo;
        },
        error: (error: any) => { },
      });
  }

  langSelect(lang: any) {
    this.langCodeSelect = lang;
    this.langCodeService.changeLangCode(this.langCodeSelect.langCode);

    let searchParams = window.location.href.toString();
    searchParams = searchParams.replace(
      /(?<=langCode=)\w+/g,
      this.langCodeSelect.langCode
    );

    window.location.href = searchParams;

    window.location.reload();
  }
  isLinkActive(obj: any) {
    if (this.router.url.replace('/', '') === obj) {
      return true;
    } else {
      if (obj === 'news') {
        const queryParamsIndex = this.router.url.indexOf('?');
        const baseUrl =
          queryParamsIndex === -1
            ? this.router.url
            : this.router.url.slice(0, queryParamsIndex);
        if (baseUrl.replace('/', '') === 'new_detail') {
          return true;
        } else {
          return false;
        }
      } else if (obj === 'group_solutions') {
        const queryParamsIndex = this.router.url.indexOf('?');
        const baseUrl =
          queryParamsIndex === -1
            ? this.router.url
            : this.router.url.slice(0, queryParamsIndex);
        if (
          baseUrl.replace('/', '') === 'group_solutions' ||
          baseUrl.replace('/', '') === 'solution_detail'
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  isLangActive(langCode: string) {
    if (langCode == this.langCodeService.getLangCodeActive()) return true;
    return false;
  }

//   doViewGroup(item: any, index: number) {
//     $('#navbarResponsive').removeClass('show');
//     $('#navbarResponsive').addClass('hidden');
//     if (item['menuCode'] == 'MENU_2') {
//       this.router
//         .navigate(['/group_solutions'], {
//           queryParams: {
//             menuCode: item['menuCode'],
//             // groupCode: group ? group['code'] : '',
//           },
//         })
//         .then(() => {
//           window.location.reload();
//           window.scroll({
//             top: 0,
//             left: 0,
//             behavior: 'smooth',
//           });
//         });
//     }
//   }
// }

  doViewGroup(item: any, index: number) {
    $('#navbarResponsive').toggleClass('show hidden');
    const queryParams = { menuCode: item.menuCode };
    const route = item.menuCode === 'MENU_6' ? '/contact' : item.menuCode === 'MENU_2' ? '/group_solutions' : '';
    if (route) {
      this.router.navigate([route], { queryParams }).then(() => {
        window.location.reload();
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
      });
    }
  }
}
function then(arg0: () => void) {
  throw new Error('Function not implemented.');
}

