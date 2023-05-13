import { PortalFlowComponent } from './portal-flow/portal-flow.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { PORTAL_INFO_ENDPOINT } from 'src/app/common/enum/EApiUrl';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { PortalDialogComponent } from './portal-dialog/portal-dialog.component';
import { PortalUtilComponent } from './portal-util/portal-util.component';
import { PortalUserPermissionComponent } from './portal-user-permission/portal-user-permission.component';
import { AuthService } from '../../../common/services/auth/auth.service';
import { PortalIntroduceComponent } from './portal-introduce/portal-introduce.component';

@Component({
    selector: 'app-portal',
    templateUrl: './portal.component.html',
    styleUrls: ['./portal.component.scss'],
})
export class PortalComponent implements OnInit {
    loading: boolean = false;
    page: number = 0;
    pageSize: number = 10;
    totalItems: number = 0;
    dataList: any = [];
    portalCode!: string;
    form!: FormGroup;
    userInfo!: any;

    lstStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Hoạt động', value: 1 },
        { name: 'Không hoạt động', value: 0 },
    ];

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã portal',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'description',
            label: 'Tên portal',
        },
        {
            name: 'urlPath',
            label: 'Link public',
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
                        obj['isActiveName'] = 'Đang bị khoá';
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
            tooltip: 'Sửa portal',
            doAction: (item: any) => {
                this.openDialog(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xoá portal',
            doAction: (item: any) => {
                this.doDeleted(item);
            },
        },
        {
            icon: 'cilUser',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Phân quyền người dùng',
            doAction: (item: any) => {
                this.openPortalPermission(item);
            },
        },
        {
            icon: 'cilOptions',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Tiện ích',
            doAction: (item: any) => {
                this.openUtils(item);
            },
        },
    ];

    constructor(
        private api: FetchApiService,
        private dialog: MatDialog,
        private toast: ToastNotiService,
        private authService: AuthService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.doSearch();
        this.userInfo = this.authService.getUserInfo();
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            portalCode: ['', Validators.maxLength(30)],
        });
    }

    doSearch(pageInfo?: any) {
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
                portalCode: this.form.controls['portalCode'].value,
                page: this.page,
                size: this.pageSize,
            };
            this.api.post(PORTAL_INFO_ENDPOINT.SEARCH, param).subscribe(
                (res) => {
                    this.dataList = res.data['list'];
                    this.totalItems = res.data['count'];
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
        }
    }

    doDeleted(item: any): any {
        let param: Object = {
            title: 'Xác nhận xóa',
            message:
                'Bạn có muốn xóa dữ liệu <strong>' +
                item['code'] +
                '</strong>?',
        };
        const dialogRef = this.dialog.open(DialogCommonComponent, {
            width: '30%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result['rs'] === true) {
                let id = item['id'];
                this.api.post(PORTAL_INFO_ENDPOINT.DELETE + '/' + id).subscribe(
                    (res) => {
                        if (res && res['data'] === true) {
                            this.toast.showSuccess(
                                'Thông báo',
                                'Xóa dữ liệu thành công.'
                            );
                            this.doSearch();
                        } else {
                            this.toast.showWarning(
                                'Thông báo',
                                'Xóa dữ liệu không thành công'
                            );
                        }
                    },
                    (error) => {
                        this.toast.showError(
                            error.message ? error.message : error
                        );
                    }
                );
            }
        });
    }

    openDialog(item?: any) {
        let param: object = {
            title: item ? 'Cập nhật thông tin' : 'Thông tin thêm mới',
            id: item ? item['id'] : null,
        };

        const dialogRef = this.dialog.open(PortalDialogComponent, {
            width: '80%',
            disableClose: true,
            data: param,
        });
        dialogRef.afterClosed().subscribe((param) => {
            this.doSearch();
        });
    }

    openUtils(item: any) {
        let param: object = {
            title: 'Tiện ích',
            item: item,
        };

        const dialogRef = this.dialog.open(PortalUtilComponent, {
            width: '90%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((param) => {
            this.doSearch();
        });
    }

    openPortalPermission(item: any) {
        let params: object = {
            title: 'Phân quyền portal người dùng',
            item: item,
        };

        this.dialog
            .open(PortalUserPermissionComponent, {
                width: '40%',
                data: params,
                disableClose: true,
            })
            .afterClosed()
            .subscribe(() => {
                this.doSearch();
            });
    }

    openFlowDialog(item: any) {
        let params: object = {
            title: 'Cấu hình luồng duyệt',
            item: item,
        };

        this.dialog
            .open(PortalFlowComponent, {
                width: '80%',
                data: params,
            })
            .afterClosed()
            .subscribe(() => {
                this.doSearch();
            });
    }
}
