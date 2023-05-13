import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FetchApiService } from "../../../common/service/api/fetch-api.service";
import { SOLUTION_VIEW_DETAIL } from "../../../common/enums/EApiUrl";
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { LanguageCodeService } from 'src/app/common/service/language/language-code';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DateTimeUtilsService } from 'src/app/common/service/datetime/date-time-utils.service';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit {
  articleDetail!: any;
  artLangId!: number;
  listOthersNews!: any[];
  articleDetailId!: string;
  langCode!: string;
  contentReplace!: SafeHtml;
  constructor(
    private _router: Router,
    public dateTimeUtils: DateTimeUtilsService,
    private route: ActivatedRoute,
    private api: FetchApiService,
    private router: Router,
    public lang: LangAppService,
    public lag: LanguageCodeService,
    private _sanitizer: DomSanitizer

  ) {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params['langCode'] && params['articleDetailId']) {
        this.langCode = params['langCode'];
        this.articleDetailId = params['articleDetailId'];
      }
    });
    this.getNewViewDetail_ver2()
  }

  ngOnInit(): void {
    const nav = document.getElementById('mainNav');
    nav?.classList.add('scrolled');
  }

  // listenRouting() {
  //   let routerUrl: string, routerList: Array<any>, target: any;
  //   this._router.events.subscribe((routers: any) => {
  //     routerUrl = routers.urlAfterRedirects;
  //     if (routerUrl && typeof routerUrl === 'string') {
  //       target = this.menu;
  //       this.breadcrumbList.length = 0;
  //       routerList = routerUrl.slice(1).split('/');
  //       routerList.forEach((routers, index) => {
  //         target = target.find((item:any) => item.path.slice(2) === routers);
  //         this.breadcrumbList.push({
  //           name: target.name,
  //           path: (index === 0) ? target.path : `${this.breadcrumbList[index - 1].path}/${target.path.slice(2)}`
  //         });
  //         if (index + 1 !== routerList.length) {
  //           target = target.children;
  //         }
  //       });
  //     }
  //   });
  // }

  getNewViewDetail() {
    if (this.artLangId) {
      this.api.get(SOLUTION_VIEW_DETAIL.GET_SOLUTION_DETAIL + this.artLangId).subscribe(
        (res: any) => {
          this.articleDetail = res.data;
          this.articleDetail = res.data;
          let rsContent = res.data['content'];
          rsContent = rsContent
            .replace(/<s>(.*?)<\/s>/g, '')
            .replace(/<del.?>(.?)<\/del>/g, '')
            .replace(/<ins.*?>/g, '<ins>')
            .replace(/<span style=".?text-decoration:line-through.?>(.*?)<\/span>/g, '')
            .replace(/<figure/g, '<figure style="width: 100%; display: grid; float:left;"')
            .replace(/<img/g, '<img style ="object-fit: contain; margin: 0px -10px; display: block; min-width: 98%; max-width: 100%; border-radius: 10px;" data-bs-toggle="modal" *ngIf="arr && arr.length > 0"data-bs-target="#staticBackdrop2"')
            .replace(/<ins\b/gi, '<span')
            .replace(/<\/ins>/gi, '</span>')
            .replace(/  +/g, ' ')
            .replace(/<p style="/g, '<p style="text-indent:0pt; width: 100%;');
          this.contentReplace = this._sanitizer.bypassSecurityTrustHtml(rsContent);
          this.listOthersNews = res.data.others;
          //dumv fake data de test
          this.listOthersNews = this.listOthersNews.concat(this.listOthersNews)
        },
        (error: any) => { }
      );
    }
  }
  // Xem chi tiết bài viết phần tin tức
  getNewViewDetail_ver2() {
    if (this.articleDetailId) {
      this.api.get(SOLUTION_VIEW_DETAIL.GET_SOLUTION_DETAIL, {
        articleDetailId: this.articleDetailId,
        langCode: this.lag.getLangCodeActive(),
      }).subscribe(
        (res: any) => {
          this.articleDetail = res.data;
          let rsContent = res.data['content'];
          rsContent = rsContent
            .replace(/<s>(.*?)<\/s>/g, '')
            .replace(/<del.?>(.?)<\/del>/g, '')
            .replace(/<ins.*?>/g, '<ins>')
            .replace(/<span style=".?text-decoration:line-through.?>(.*?)<\/span>/g, '')
            .replace(/<figure/g, '<figure style="width: 100%; float:left; text-align: center;"')
            .replace(/<img/g, '<img style ="object-fit: contain; min-width: 50%; text-align: center; max-width: 100%; border-radius: 10px;" data-bs-toggle="modal" *ngIf="arr && arr.length > 0"data-bs-target="#staticBackdrop2"')
            .replace(/<ins\b/gi, '<span')
            .replace(/<\/ins>/gi, '</span>')
            .replace(/  +/g, ' ')
            .replace(/<tr><td>/g, '')
            .replace(/<table/g, '<table style="width:100%";')
            .replace(/<tbody/g, '<tbody style="width:100%"')
            .replace(/<tr/g, '<tr style="width:100%; "')
            .replace(/<td.*?>/g, '<td style="width:100%;text-align: center; "')
            .replace(/<h1 style=\"margin-top:0pt; margin-bottom:0pt; text-indent:36pt;/g, '<h1 style=\"margin-top:0pt; margin-bottom:0pt;text-indent:0pt;font-weight: bold; ')
            .replace(/<p style=\"margin-top:0pt; margin-bottom:0pt; text-indent:36pt;/g, '<p style=\"margin-top:0pt; margin-bottom:0pt;text-indent:0pt; ');
          this.contentReplace = this._sanitizer.bypassSecurityTrustHtml(rsContent);
          this.listOthersNews = res.data.others;
        },
        (error: any) => { }
      );
    }
  }
  //=== xem chi tiet bai viet
  doViewDetailNew(item: any) {
    this.articleDetailId = item.articleDetailId;
    this.router.navigate(['/new_detail'], { queryParams: { articleDetailId: item.articleDetailId, langCode: this.lag.getLangCodeActive() } });
    this.getNewViewDetail_ver2();
    window.scroll(0, 0);

  }

  shareLink(socialType: number) {

    let navUrl;

    switch (socialType) {
      case 0:
        navUrl = 'https://www.facebook.com/sharer/sharer.php?u=';
        break;
      case 1:
        navUrl = 'https://twitter.com/intent/tweet?text=';
        break;
      case 2:
        navUrl = 'https://www.linkedin.com/shareArticle?url=';
        break;
      case 3:
        navUrl = 'https://www.instagram.com/sharer.php?u=';
        break;
      default:
        break;
    }
    navUrl += this.router.url;
    window.open(navUrl, "_blank");
  }

}
