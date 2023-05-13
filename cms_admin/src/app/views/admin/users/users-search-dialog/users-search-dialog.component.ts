import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {USERS_ENDPOINT,} from 'src/app/common/enum/EApiUrl';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-users-search-dialog',
    templateUrl: './users-search-dialog.component.html',
    styleUrls: ['./users-search-dialog.component.scss'],
})
export class UsersSearchDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;

    keySearch: string = '';

    page: number = 0;
    pageSize: number = 10;
    dataList: any = [];
    totalItems: number = 0;
    userActive!: string;
    userChoice: any = [];
    tableColumns: any = [
        {
            name: 'userName',
            label: 'Tên đăng nhập',
        },
        {
            name: 'email',
            label: 'Email',
        },
        {
            name: 'roleName',
            label: 'Quyền hệ thống',
        },
    ];

    constructor(
        private dialogRef: MatDialogRef<UsersSearchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.userActive = this.dataInput['userActive'];
        this.userChoice = this.dataInput['userChoice'];
        this.getUserInfo();
    }

    getUserInfo() {
        this.loading = true;
        this.api
            .get(USERS_ENDPOINT.FOR_ROLE_TREE, {
                page: this.page,
                size: this.pageSize,
                keySearch: this.keySearch,
            })
            .subscribe(
                (res) => {
                    let data = res.data['list'];
                    this.doAnalysisData(data);

                    this.dataList = data;
                    this.totalItems = res.data['count'];
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
    }

    doAnalysisData(data: any) {
        for (let i = 0; i < data.length; i++) {
            let dataItem = data[i];
            //active thang da chon truoc day de edit
            if (dataItem['userName'] === this.userActive) {
                dataItem['checked'] = true;
            }
            //visibility off thang da chon truoc do
            if (
                _.includes(this.userChoice, dataItem['userName']) &&
                dataItem['userName'] !== this.userActive
            ) {
                dataItem['visibility'] = false;
            } else {
                dataItem['visibility'] = true;
            }
        }
    }

    doChangePage(pageInfo?: any) {
        if (pageInfo) {
            this.page = pageInfo['page'];
            this.pageSize = pageInfo['pageSize'];
        }
        this.getUserInfo();
    }

    doSave() {
        let dataChoice = _.filter(this.dataList, (obj) => {
            return obj['checked'] === true;
        });
        this.dialogRef.close(dataChoice.length > 0 ? dataChoice[0] : null);
    }

    doClose(): any {
        this.dialogRef.close();
    }
}
