import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { environment } from "../../../environments/environment";
import { SOLUTION_PAGE } from "../../common/enums/EApiUrl";
import { FetchApiService } from "../../common/service/api/fetch-api.service";
import { LanguageCodeService } from "../../common/service/language/language-code";
import { CustomPaginator } from '../paginator-component/CustomPaginator';

@Component({
  selector: 'app-solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginator },
  ]
})
export class SolutionsComponent implements OnInit {
  groupCode!: string;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  listAllSolution!: any[]
  groupName = '';
  length = 50;
  pageSize = 3;
  pageIndex = 0;
  groupDescrible = '';

  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    private router: Router,
    private route: ActivatedRoute,
    public lang: LangAppService,
    public lag: LanguageCodeService) {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params['groupCode']) {
        this.groupCode = params['groupCode'];
      }
  })
  }

  ngOnInit(): void {
    this.getAllSolution();
  }

//feedback
//=== get all solution
  getAllSolution() {
    let param = {
      portalCode: environment.portalCode,
      groupCode: this.groupCode,
      menuCode: 'MENU_2',
      page: this.pageIndex,
      size: this.pageSize,
      langCode: this.langCodeService.getLangCodeActive(),
    }
    this.api.post(SOLUTION_PAGE.GET_ALL_SOLUTION, param).subscribe((res) => {
      this.listAllSolution = res.data.articles;
      this.length = res.data.totalCount;
      this.groupName = res.data.groupName ? res.data.groupName : this.lang.parseTextCommon('solutionGroupName');
      // this.groupDescrible = res.data.groupDescrible;
      window.scroll(0,0);
    }, (error) => {
      console.log('error', error);
    })
  }
  //=== xem chi tiet
  doViewDetailSolution(item:any){
    this.router.navigate(['/solution_detail'], { queryParams: { articleDetailId: item.articleDetailId, langCode:  this.lag.getLangCodeActive()} });
  }
  //=== click phan trang
  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getAllSolution();
  }

}
