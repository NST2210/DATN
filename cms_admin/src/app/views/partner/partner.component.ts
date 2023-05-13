import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LINKED } from 'src/app/common/enum/EApiUrl';
import { EACTIVE } from 'src/app/common/enum/EStatus';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { PartnerDialogComponent } from './partner-dialog/partner-dialog.component';

@Component({
    selector: 'app-partner',
    templateUrl: './partner.component.html',
    styleUrls: ['./partner.component.scss'],
})
export class PartnerComponent implements OnInit {
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
            name: 'langCode',
            label: 'Mã Đối Tác',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'title',
            label: 'Tên Đối Tác',
            options: { width: '15%', align: 'text-center' },
        },
        {
            name: 'logo',
            label: 'Logo Đối Tác',
            options: {
                customBodyRender: (value: any, obj: any) => {
                    let strHtml =
                        '<img class="logo-icon" src="data:image/jpg;base64,';
                    strHtml += value;
                    strHtml += '"/>&nbsp;&nbsp;';
                    return strHtml;
                },
            },
        },
        {
            name: 'link',
            label: 'Link Đối Tác',
            options: {
                customBodyRender: (value: any, obj: any) => {
                    let strHtml =
                        '<a href="' +
                        value +
                        '" styte="width:15%;text-align: center;">' +
                        value +
                        '</a>';
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
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'updateDate',
            label: 'Ngày cập nhật',
            options: {
                width: '10%',
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
            tooltip: 'Sửa đối tác',
            doAction: (item: any) => {
                this.doOpenDialog(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xóa đối tác',
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
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.doSearch();
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            title: ['', Validators.maxLength(70)],
            langCode: ['', Validators.maxLength(30)],
        });
    }

    doSearch(pageInfo?: any): any {
        if (this.form.invalid) {
            this.toast.showWarning(
                'Thông báo',
                'Vui lòng nhập lại dữ liệu tìm kiếm!'
            );
            return;
        } else {
            this.loading = true;
            if (pageInfo) {
                this.page = pageInfo['page'];
                this.pageSize = pageInfo['pageSize'];
            }

            let param = {
                langCode: this.form.controls['langCode'].value,
                title: this.form.controls['title'].value,
                status: this.status,
                page: this.page,
                size: this.pageSize,
            };
            this.api.post(LINKED.SEARCH_LINKED, param).subscribe(
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
            title: item
                ? 'Cập nhật thông tin đối tác'
                : 'Thêm mới thông tin đối tác',
            langId: item ? item['id'] : null,
        };
        const dialogRef = this.dialog.open(PartnerDialogComponent, {
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
                'Bạn có muốn xóa thông tin đối tác <strong>' +
                item['title'] +
                ' (' +
                item['langCode'] +
                ')' +
                '</strong>?',
        };
        const dialogRef = this.dialog.open(DialogCommonComponent, {
            width: '30%',
            data: param,
            disableClose: true,
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
            .post(LINKED.DELETE, null, {
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
                            'Đối tác đang được sử dụng'
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
