import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorIntl,
  PageEvent,
} from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { CustomPaginator } from '../paginator-component/CustomPaginator';
import { FetchApiService } from 'src/app/common/service/api/fetch-api.service';
import { LanguageCodeService } from 'src/app/common/service/language/language-code';
import { environment } from 'src/environments/environment';
import { HOME_PAGE, SOLUTION_PAGE } from 'src/app/common/enums/EApiUrl';
import { HelperUtilsService } from 'src/app/common/helper/helper-utils.service';

@Component({
  selector: 'app-group-solutions',
  templateUrl: './group-solutions.component.html',
  styleUrls: ['./group-solutions.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class GroupSolutionsComponent {
  listSolution!: any[];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  listAllSolution!: any[];
  dataList!: any[];
  groupName = '';
  length = 50;
  pageSize = 3;
  pageIndex = 0;
  isView: boolean = false;
  keyWord!: string;
  menuCode!: any;
  groupCode!: string;
  menuInfo: any;
  dataFirst: any;
  menuName!: string;
  menuInfoChill!: any[];
  totalItems: number = 0;

  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    private router: Router,
    public lang: LangAppService,
    public lag: LanguageCodeService,
    private route: ActivatedRoute,
    public helper: HelperUtilsService
  ) {
    this.route.queryParams.subscribe((params: any) => {
      if (params) {
        this.menuCode = params['menuCode'];
        this.groupCode = params['groupCode'];
        this.getMenuInfo(this.menuCode, this.groupCode);
        this.searchData(this.menuInfo, '');
      }
    });
  }

  getMenuInfo(menuCode: string, groupCode: string) {
    this.api
      .get(HOME_PAGE.INFO_BY_CODE, {
        portalCode: environment.portalCode,
        langCode: this.langCodeService.getLangCodeActive(),
        menuCode: menuCode,
      })
      .subscribe({
        next: (rs: any) => {
          this.menuInfo = rs['data'];
          this.menuName = this.menuInfo['menuName'];
          if (groupCode) {
            this.dataFirstByMenu('', groupCode);
            this.menuInfoChill = this.menuInfo.child.forEach((obj: any) => {
              if (obj['menuCode'] === groupCode) {
                obj['active'] = true;
              }
              return;
            });
          } else {
            this.dataFirstByMenu(this.menuInfo.groupCode, '');
          }
        },
        error: () => {},
      });
  }

  dataFirstByMenu(menuCode: string, groupCode: string) {
    menuCode = this.menuCode;
    groupCode = this.groupCode;
    this.api
      .post(HOME_PAGE.DATA_FIRST_BY_MENU, {
        portalCode: environment.portalCode,
        langCode: this.langCodeService.getLangCodeActive(),
        menuCode: this.menuCode,
        groupCode: this.groupCode,
        page: this.pageIndex,
        size: this.pageSize,
      })
      .subscribe({
        next: (rs: any) => {
          this.dataFirst = rs['data'];
        },
        error: () => {},
      });
  }

  // Xem chi tiết bài mới nhất trên đầu
  doDetail(item: any) {
    this.router
      .navigate(['/solution_detail'], {
        queryParams: {
          articleDetailId: item['artDetailLangId'],
          langCode: this.lag.getLangCodeActive(),
        },
      })
      .then(() => {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      });
  }

  // Xem chi tiết dưới 3 bài mới nhất
  doDetailNew(item: any) {
    this.router
      .navigate(['/solution_detail'], {
        queryParams: {
          articleDetailId: item['articleDetailId'],
          langCode: this.lag.getLangCodeActive(),
        },
      })
      .then(() => {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      });
  }

  doChangeGroup(item: any) {
    this.menuInfo.child.forEach((obj: any) => {
      obj['active'] = false;
    });
    item['active'] = true;
    this.groupCode = item['menuCode'];
    this.pageIndex = 0;
    this.searchData('', item['code']);
    this.dataFirstByMenu('', item['menuCode']);
  }

  doBackHome() {
    this.menuInfo.child.forEach((obj: any) => {
      obj['active'] = false;
    });
    this.pageIndex = 0;
    this.groupCode = null as any;
    this.searchData(this.menuInfo['code'], '');
    this.dataFirstByMenu(this.menuInfo['code'], '');
  }

  searchData(menuCode: string, groupCode: string) {
    menuCode = this.menuCode;
    groupCode = this.groupCode;
    this.api
      .post(SOLUTION_PAGE.GET_ALL_SOLUTION, {
        portalCode: environment.portalCode,
        langCode: this.langCodeService.getLangCodeActive(),
        menuCode,
        groupCode,
        page: this.pageIndex,
        size: this.pageSize,
      })
      .subscribe({
        next: (rs: any) => {
          this.totalItems = rs['data']['count'];
          this.dataList = rs['data']['articles'];
          this.length = rs['data']['totalCount'];
        },
        error: () => {},
      });
  }

  //=== xem chi tiet
  doViewDetailSolution(item: any) {
    this.router.navigate(['/solution'], {
      queryParams: { groupCode: item.groupCode },
    });
  }

  //=== click phan trang
  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.searchData('', '');
  }
}
