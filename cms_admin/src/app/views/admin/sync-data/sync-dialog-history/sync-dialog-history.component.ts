import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SYNC_DATA } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { SyncDataComponent } from '../sync-data.component';

@Component({
  selector: 'app-sync-dialog-history',
  templateUrl: './sync-dialog-history.component.html',
  styleUrls: ['./sync-dialog-history.component.scss']
})
export class SyncDialogHistoryComponent implements OnInit {
  loading: boolean = false;
  dataList: any = [];
  totalItem:number=0;
  pageSize:number = 10;
  page:number = 0;

  constructor(
    private dialogRef: MatDialogRef<SyncDataComponent>,
    @Inject(MAT_DIALOG_DATA) public dataInput: any,
    private api: FetchApiService,
    private toast: ToastNotiService
  ) { }

  ngOnInit(): void {
    if (this.dataInput) {
      this.doSearch();
    }
  }

  doSearch(pageInfo?:any) {
    if (pageInfo) {
      this.page = pageInfo['pageIndex'];
      this.pageSize = pageInfo['pageSize'];
  }
    let param={
      refCode: this.dataInput['refCode'],
      page: this.page,
      pageSize: this.pageSize
    }
    this.api
      .post(SYNC_DATA.SEARCH_DATA_HISTORY, param)
      .subscribe(
        (res) => {
          this.loading = false;
          this.dataList=res['data']['list'];
          this.totalItem=res['data']['count'];
        },
        (error) => {
          this.loading = false;
          this.toast.showError(error.message ? error.message : error);
        }
      );
  }
  doClose() {
    this.dialogRef.close();
}

}
