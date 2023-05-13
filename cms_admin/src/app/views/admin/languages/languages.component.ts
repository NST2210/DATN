import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from 'moment';
import { LANGUAGE_ENDPOINT } from 'src/app/common/enum/EApiUrl';
import { EACTIVE } from 'src/app/common/enum/EStatus';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { EICON_TYPE } from './../../../common/enum/EType';
import { LanguagesDialogComponent } from './languages-dialog/languages-dialog.component';

@Component({
    selector: 'app-languages',
    templateUrl: './languages.component.html',
    styleUrls: ['./languages.component.scss'],
})
export class LanguagesComponent implements OnInit {
    dataLang: any = [];
    status: number = -1;
    loading: boolean = false;
    page: number = 0;
    pageSize: number = 10;
    totalItems: number = 0;
    form!: FormGroup;
    dataList: any = [];

    lstStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Đang hoạt động', value: 1 },
        { name: 'Không hoạt động', value: 0 },
    ];

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã Ngôn Ngữ',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'name',
            label: 'Tên Ngôn Ngữ',
            options: {
                customBodyRender: (value: any, obj: any) => {
                    let strHtml =
                        '<img class="lang-icon" src="data:image/jpg;base64,';
                    strHtml += obj['icon'];
                    strHtml += '"/>&nbsp;&nbsp;';
                    strHtml += value;
                    return strHtml;
                },
            },
        },
        {
            name: 'createdBy',
            label: 'Người tạo',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'createdDate',
            label: 'Ngày tạo',
            options: {
                width: '15%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'updateBy',
            label: 'Người cập nhật',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'updateDate',
            label: 'Ngày cập nhật',
            options: {
                width: '15%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'isActive',
            label: 'Trạng thái',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';
                    if (value === 1) {
                        strHtml += ' class="status-success" ';
                        obj['isActiveName'] = 'Đang hoạt động';
                    } else {
                        strHtml += ' class="status-error" ';
                        obj['isActiveName'] = 'Không hoạt động';
                    }
                    strHtml += '>' + obj['isActiveName'] + '</span>';
                    return strHtml;
                },
            },
        },
    ];

    tableAction: any = [
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Sửa ngôn ngữ',
            doAction: (item: any) => {
                this.doOpenDialog(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xóa ngôn ngữ',
            doAction: (item: any) => {
                this.doDeleted(item);
            },
        },
        {
            iconType: EICON_TYPE.CORE_UI,
            customIcon: (obj: any) => {
                return obj['isActive'] === 0 ? 'cilCheckCircle' : 'cilBan';
            },
            customTooltip: (obj: any) => {
                return obj['isActive'] === 0
                    ? 'Đang hoạt động'
                    : 'Không hoạt động';
            },
            doAction: (item: any) => {
                let activeCurrent = item['isActive'];
                let activeChange;

                if (activeCurrent === EACTIVE.ACTIVE) {
                    activeChange = EACTIVE.IN_ACTIVE;
                } else {
                    activeChange = EACTIVE.ACTIVE;
                }
                this.changeActiveStatus(item['id'], activeChange);
            },
        },
    ];

    constructor(
        private api: FetchApiService,
        private dialog: MatDialog,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.buildForm();
        this.doSearch();
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            langName: ['', Validators.maxLength(70)],
            langCode: ['', Validators.maxLength(30)],
        })
    }

    doSearch(pageInfo?: any): any {

        if (this.form.invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập lại dữ liệu tìm kiếm!');
            return;
        } else {
            this.loading = true;
            if (pageInfo) {
                this.page = pageInfo['page'];
                this.pageSize = pageInfo['pageSize'];
            }

            let param = {
                langCode: this.form.controls['langCode'].value,
                langName: this.form.controls['langName'].value,
                status: this.status,
                page: this.page,
                size: this.pageSize,
            };
            this.api.post(LANGUAGE_ENDPOINT.SEARCH_LANGUAGES, param).subscribe(
                (res) => {
                    this.dataList = res.data['list'];
                    this.totalItems = res.data['count'];
                    if (this.totalItems <= param['size']) {
                        this.page = 0;
                    }
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
        }
    }

    doOpenDialog(item: any): any {
        let param: object = {
            title: item ? 'Cập nhật thông tin ngôn ngữ' : 'Thêm mới ngôn ngữ',
            langId: item ? item['id'] : null,
        };

        const dialogRef = this.dialog.open(LanguagesDialogComponent, {
            width: '50%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    doDeleted(item: any): any {
        let param: Object = {
            title: 'Xác nhận xóa',
            message:
                'Bạn có muốn xóa thông tin ngôn ngữ <strong>' +
                item['name'] +
                ' (' +
                item['code'] +
                ')' +
                '</strong>?',
        };
        const dialogRef = this.dialog.open(DialogCommonComponent, {
            width: '30%',
            data: param,
            disableClose:true
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result['rs'] === true) {
                this.changeActiveStatus(item['id'], EACTIVE.DELETED);
            }
        });
    }

    changeActiveStatus(langId: number, activeStatus: number) {
        this.loading = true;
        this.api
            .post(LANGUAGE_ENDPOINT.DELETE, null, {
                langId: langId,
                activeStatus: activeStatus,
            })
            .subscribe(
                (res) => {
                    if (res && res.data === true) {
                        let msg;
                        if (activeStatus === EACTIVE.DELETED) {
                            msg = 'Xoá dữ liệu thành công';
                        } else {
                            msg = 'Chuyển trạng thái thành công!';
                        }

                        this.toast.showSuccess('Thông báo', msg);
                        this.doSearch(0);
                    } else {
                        this.toast.showWarning(
                            'Thông báo',
                            'Ngôn ngữ đang được sử dụng'
                        );
                    }
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
    }
}
