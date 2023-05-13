import { Component, OnInit, ViewChild } from '@angular/core';
import { FetchApiService } from "../../common/service/api/fetch-api.service";
import { LanguageCodeService } from "../../common/service/language/language-code";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { NEW_PAGE, SOLUTION_PAGE } from "../../common/enums/EApiUrl";
import { MatPaginator, MatPaginatorIntl, PageEvent } from "@angular/material/paginator";
import { CustomPaginator } from '../paginator-component/CustomPaginator';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { forEach } from 'lodash';
import { HelperUtilsService } from 'src/app/common/helper/helper-utils.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginator },
  ]
})
export class NewsComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  articleOnlyHome!: any;
  artFirstRight!: any[]
  listAllNews!: any[]
  groupName = '';
  length = 50;
  pageSize = 3;
  pageIndex = 0;

  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    private router: Router,
    public lang: LangAppService,
    public lag: LanguageCodeService,
    public helper: HelperUtilsService
  ) { }

  ngOnInit(): void {
    this.getAllHotNews();
    this.getAllNews();
  }

  //=== get all hot
  getAllHotNews() {
    let param = {
      portalCode: environment.portalCode,
      langCode: this.langCodeService.getLangCodeActive(),
    }
    this.api.get(NEW_PAGE.GET_HOT_NEW, param).subscribe((res) => {
      this.articleOnlyHome = res.data.articleOnlyHome;
      this.artFirstRight = res.data.artFirstRight;
    }, (error) => {
      console.log('error', error);
    })
  }

  //=== get all new
  getAllNews() {
    let param = {
      portalCode: environment.portalCode,
      menuCode: 'MENU_4',
      page: this.pageIndex + 1,
      size: this.pageSize,
      langCode: this.langCodeService.getLangCodeActive(),
    }
    this.api.post(NEW_PAGE.GET_ALL_NEW, param).subscribe((res) => {
      this.listAllNews = res.data.articles;
      this.length = res.data.totalCount - 3;
      this.groupName = res.data.groupName;
    }, (error) => {
      console.log('error', error);
    })
  }

  //=== click phan trang
  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getAllNews();
  }

  //=== xem chi tiet bai viet
  doViewDetailNew(item: any) {
    this.router.navigate(['/new_detail'], { queryParams: { articleDetailId: item.articleDetailId, langCode: this.lag.getLangCodeActive() } });
  }
}
