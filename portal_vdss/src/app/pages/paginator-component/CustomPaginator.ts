import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { LangAppService } from "src/app/common/service/language/lang-app.service";

@Injectable()
export class CustomPaginator extends MatPaginatorIntl {
  override itemsPerPageLabel!: string;
  override nextPageLabel!: string;
  override previousPageLabel!: string;
  override lastPageLabel!: string;
  override firstPageLabel!: string;
  langCodeActive!: string;
  constructor(
    public lang: LangAppService,
  ) {
    super();
    // this.langCodeActive = this.lang.getLangCodeActive();
    this.getAndInitTranslations();
  }
  ngOnInit(): void {
    this.getAndInitTranslations();
  }

  getAndInitTranslations() {
    if (this.lang.getLangCodeActive() === 'VI'){
      this.itemsPerPageLabel = 'Số dòng hiển thị:';
      this.nextPageLabel = 'Trang tiếp';
      this.previousPageLabel = 'Trang trước';
      this.lastPageLabel = 'Trang cuối';
      this.firstPageLabel = 'Trang đầu';
    }else if (this.lang.getLangCodeActive() === 'EN') {
      this.itemsPerPageLabel = 'Number of lines displayed:';
      this.nextPageLabel = 'Next Page';
      this.previousPageLabel = 'Previous Page';
      this.lastPageLabel = 'Last Page';
      this.firstPageLabel = 'First Page';
    }else if (this.lang.getLangCodeActive() === 'ZH'){
      this.itemsPerPageLabel = '显示的行数：';
      this.nextPageLabel = '下一页';
      this.previousPageLabel = '上一页';
      this.lastPageLabel = '最后一页';
      this.firstPageLabel = '首页';
    }

  }

   override getRangeLabel = (page: number, pageSize: number, length: number) => {
     if (length === 0 || pageSize === 0) {
      if (this.lang.getLangCodeActive() === 'EN'){
        return '0 Total ' + length;
      }
      if (this.lang.getLangCodeActive() === 'ZH'){
        return '0 全部的 ' + length;
      }
       return '0 Tổng số ' + length;
     }
     length = Math.max(length, 0);
     const startIndex = page * pageSize;
     // If the start index exceeds the list length, do not try and fix the end index to the end.
     const endIndex = startIndex < length ?
       Math.min(startIndex + pageSize, length) :
       startIndex + pageSize;
     // return startIndex + 1 + ' - ' + endIndex + ' Tổng số ' + length;
     if (this.lang.getLangCodeActive() === 'EN'){
      return `${startIndex + 1} - ${endIndex} Total ${length}`;
    }
    if (this.lang.getLangCodeActive() === 'ZH'){
      return `${startIndex + 1} - ${endIndex} 全部的 ${length}`;
    }
     return `${startIndex + 1} - ${endIndex} Tổng số ${length}`;
   };

}
