import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {ARTICLE_DETAIL, USERS_ENDPOINT} from "../../../common/enum/EApiUrl";
import {AuthService} from "../../../common/services/auth/auth.service";
import {MatTableDataSource} from "@angular/material/table";

@Component({
    selector: 'app-article-switch-user',
    templateUrl: './article-switch-user.component.html',
    styleUrls: ['./article-switch-user.component.scss'],
})
export class ArticleSwitchUserComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    roleCode!: string;
    selectedRow: any;
    displayedColumns: string[] = ['no', 'userName', 'radioButton'];
    dataSource: any;
    userName!: string;
    portalCode!: string;

    totalItem: number = 0;
    pageSize: number = 10;
    page: number = 0;

    constructor(
        private dialogRef: MatDialogRef<ArticleSwitchUserComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private authService: AuthService,
        private api: FetchApiService,
        private toast: ToastNotiService,
    ) {
        this.title = this.dataInput['title'];
    }

    ngOnInit(): void {
        this.roleCode = this.authService.getUserInfo()['authorities'][0];
        this.userName = this.authService.getUserInfo()['userName'];
        this.getAllUserByRole();
    }

    getAllUserByRole(pageInfo?: any) {
        if (pageInfo) {
            this.page = pageInfo['pageIndex'];
            this.pageSize = pageInfo['pageSize'];
        }
        this.loading = true;
        this.api.post(USERS_ENDPOINT.ALL_USER_ROLE, null, {
            roleCode: this.roleCode,
            portalCode: this.dataInput['portalCode'],
            ids: this.dataInput['ids'],
            userName: this.userName,
            page: this.page,
            size: this.pageSize,
        }).subscribe((res) => {
            if (res) {
                this.dataSource = new MatTableDataSource<any>(res.data.list);
                this.totalItem = res.data.count;
            }
            this.loading = false;
        }, () => {
            this.loading = false;
        })
    }

    doClose(): any {
        this.dialogRef.close();
    }

    filterUser(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    doSwitchApprove() {
        if (this.selectedRow != null) {
            this.api.post(ARTICLE_DETAIL.SWITCH_USER_MULTI_ART, null, {
                ids: this.dataInput['ids'],
                userName: this.selectedRow['userName'],
            }).subscribe((res) => {
                if (res.data == 0) {
                    this.toast.showSuccess('Thông báo', 'Chuyển người duyệt thành công!');
                    this.doClose();
                } else {
                    this.toast.showWarning('Thông báo', 'Chuyển người duyệt không thành công!');
                }
                this.doClose();
            }, (error) => {
                this.toast.showError(error.message ? error.message : error);
            });
        } else {
            this.toast.showWarning('Thông báo', 'Vui lòng chọn user cần chuyển duyệt!');
        }
    }
}
