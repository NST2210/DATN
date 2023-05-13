import { Component, OnInit } from '@angular/core';
import { PORTAL_INFO_ENDPOINT, SYNC_DATA } from 'src/app/common/enum/EApiUrl';
import { MatDialog } from '@angular/material/dialog';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { SyncDialogHistoryComponent } from './sync-dialog-history/sync-dialog-history.component';

@Component({
    selector: 'app-sync-data',
    templateUrl: './sync-data.component.html',
    styleUrls: ['./sync-data.component.scss'],
})
export class SyncDataComponent implements OnInit {
    loading: boolean = false;
    dataList: any = [];
    portalCode: string = 'TCCAND';
    lstPortal: any = [];

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) { }

    ngOnInit(): void {
        this.getAllPortal();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
        }

    }

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe(
            (res) => {
                this.lstPortal = res['data'];
                this.loading = false;
                // this.portalCode = '';
            },
            () => {
                this.loading = false;
            }
        );
    }

    doSearch() {
        if (!this.portalCode) {
            this.toast.showWarning(
                'Thông báo',
                'Chọn portal trước khi đồng bộ dữ liệu'
            );
            return;
        }

        this.loading = true;
        this.api
            .get(SYNC_DATA.SEARCH_DATA, { portalCode: this.portalCode })
            .subscribe(
                (res) => {
                    this.loading = false;
                    this.dataList = res['data'];
                },
                () => {
                    this.loading = false;
                }
            );
    }

    doSync(item: any) {
        if (!this.portalCode) {
            this.toast.showWarning(
                'Thông báo',
                'Chọn portal trước khi đồng bộ dữ liệu'
            );
            return;
        }
        this.loading = true;
        this.api
            .post(SYNC_DATA.SYNC, null, {
                syncCode: item['refCode'],
                portalCode: this.portalCode,
            })
            .subscribe(
                (res) => {
                    this.loading = false;
                    this.toast.showSuccess(
                        'Thông báo',
                        'Đồng bộ dữ liệu thành công'
                    );
                    this.doSearch();
                },
                (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                }
            );
    }

    onChangePortal(value: any) {
        this.doSearch();
    }
    doDisplayHistory(item: any) {
        const dialogRef = this.dialog.open(SyncDialogHistoryComponent, {
            width: '50%',
            data: item,
            disableClose: true
        });
    }
}
