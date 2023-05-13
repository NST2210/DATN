import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuModel } from './common/model/MenuModel';
import { FetchApiService } from './common/service/api/fetch-api.service';
import { LanguageCodeService } from './common/service/language/language-code';
import { HOME_PAGE, LANG } from './common/enums/EApiUrl';
import { environment } from '../environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { LangAppService } from './common/service/language/lang-app.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  menus: Array<MenuModel> = [];
  title = 'vdss';
  dataFooter!: any;
  portalCode: string = environment.portalCode;
  langCodeActive!: string;
  isInitialized!: boolean;
  contentReplace!: SafeHtml;

  constructor(
    private api: FetchApiService,
    private lag: LanguageCodeService,
    public lang: LangAppService,
    private _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getLagDefault();
  }
  getLagDefault() {
    let param = {
      portalCode: environment.portalCode,
    };
    this.api.get(LANG.LAG_DEFAULT, param).subscribe({
      next: (res) => {
        sessionStorage.setItem(environment.langCodeDefault, res.data.langCode);
        this.getDataFooter();
        this.getMenus();
        this.getDataConfigText();
        this.isInitialized = true;
      },
      error: (error) => {
        console.log('error', error);
      },
    });
  }

  //get data default
  getDataFooter() {
    this.api
      .get(HOME_PAGE.FOOTER_DATA, {
        portalCode: this.portalCode,
        portalLang: this.lag.getLangCodeActive(),
      })
      .subscribe({
        next: (rs: any) => {
          if (rs.data) {
            this.dataFooter = rs['data'];
            let rsContent = rs.data['content'];
            rsContent = rsContent
              .replace(
                /<img/g,
                '<img style ="min-width: 11%; max-width: 22%;" data-bs-toggle="modal" *ngIf="arr && arr.length > 0"data-bs-target="#staticBackdrop2"'
              )
              .replace(/<ins\b/gi, '<span')
              .replace(/  +/g, ' ').replace(
                /<strong/g,
                '<strong style ="font-family: Montserrat !important;"'
              )
              .replace(/  +/g, ' ').replace(
                /<h4/g,
                '<h4 style ="font-family: Montserrat !important;"'
              );
            this.contentReplace =
              this._sanitizer.bypassSecurityTrustHtml(rsContent);
          }
        },
        error: (error: any) => {},
      });
  }

  getMenus() {
    this.api
      .get(HOME_PAGE.MENUS, {
        portalCode: this.portalCode,
        langCode: this.lag.getLangCodeActive(),
      })
      .subscribe({
        next: (rs: any) => {
          this.menus = rs['data'];
        },
        error: (error: any) => {},
      });
  }

  getDataConfigText() {
    this.api
      .get(HOME_PAGE.DATA_CONFIG_TEXT, {
        portalCode: this.portalCode,
        portalLang: this.lag.getLangCodeActive(),
      })
      .subscribe({
        next: (rs: any) => {
          this.lang.saveTextCommon(rs['data']);
        },
        error: () => {},
      });
  }
}
