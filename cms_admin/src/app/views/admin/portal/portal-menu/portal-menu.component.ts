import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import {
    LANGUAGE_ENDPOINT,
    PORTAL_INFO_ENDPOINT,
    PORTAL_MENU_LANG_ENDPOINT,
} from '../../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../../common/services/api/fetch-api.service';
import { ToastNotiService } from '../../../../common/services/toastr/toast-noti.service';
import { PortalMenuDialogComponent } from './portal-menu-dialog/portal-menu-dialog.component';

@Component({
    selector: 'app-portal-menu',
    templateUrl: './portal-menu.component.html',
    styleUrls: ['./portal-menu.component.scss'],
})
export class PortalMenuComponent implements OnInit {
    loading: boolean = false;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    portalCode: string = 'VDSS';
    langCode!: string;
    isActive!: number;
    lstPortal: any = [];
    lstLangByPortal: any = [];
    menuCode!: string;
    name!: string;
    namePortal!: string;
    form!: FormGroup;
    articleGroupId!: null;

    dataList: any = [];
    lstActiveStatus: any = [
        { name: '---Tất cả---', value: null },
        { name: 'Đang hoạt động', value: 1 },
        { name: 'Không hoạt động', value: 0 },
    ];

    tableColumns: any = [
        {
            name: 'menuCode',
            label: 'Mã menu',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'url',
            label: 'URL',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'displayOrder',
            label: 'Thứ tự hiển thị',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'createdBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'createdDate',
            label: 'Ngày tạo',
            options: {
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'isActive',
            label: 'Trạng thái hoạt động',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    let strHtml = '<span';
                    let msg;
                    if (value === 1) {
                        strHtml += ' class="status-success" ';
                        msg = 'Đang hoạt động';
                    } else {
                        strHtml += ' class="status-error" ';
                        msg = 'Không hoạt động';
                    }
                    strHtml += '>' + msg + '</span>';
                    return strHtml;
                },
            },
        },
    ];

    tableAction: any = [
        {
            icon: 'cilZoom',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xem chi tiết',
            doAction: (item: any) => {
                this.openDialog('detail', item);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Chỉnh sửa',
            doAction: (item: any) => {
                this.openDialog('update', item);
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
                this.changeActiveStatus(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xoá menu',
            doAction: (item: any) => {
                this.onDelete(item);
            },
        },
    ];

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.getAllPortal();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
        }
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            menuCode: ['', Validators.maxLength(30)],
        });
    }

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe(
            (res) => {
                this.lstPortal = res['data'];
                this.loading = false;
                if (this.lstPortal) {
                    this.lstPortal.forEach((obj: any) => {
                        if (obj['code'] === this.portalCode) {
                            this.namePortal = obj['description'];
                        }
                    });
                }
            },
            () => {
                this.loading = false;
            }
        );
    }

    onChangePortal(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, {
                    portalCode: value,
                })
                .subscribe(
                    (res) => {
                        this.lstLangByPortal = res['data'];
                        this.loading = false;
                        this.doSearch();
                    },
                    () => {
                        this.loading = false;
                    }
                );
        }
        this.lstPortal.forEach((obj: any) => {
            if (obj['code'] === value) {
                this.namePortal = obj['description'];
            }
        });
    }

    onChangeLang(value: any) {
        if (value) {
            this.doSearch();
        }
    }

    doSearch(pageInfo?: any): any {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để tìm kiếm');
            return;
        }
        if (pageInfo) {
            this.page = pageInfo['page'];
            this.pageSize = pageInfo['pageSize'];
        }
        if (this.form.invalid) {
            this.toast.showWarning(
                'Thông báo',
                'Vui lòng nhập lại dữ liệu tìm kiếm!'
            );
            return;
        } else {
            this.loading = true;
            let params = {
                portalCode: this.portalCode,
                isActive: this.isActive,
                menuCode: this.form.controls['menuCode'].value,
                page: this.page,
                size: this.pageSize,
            };
            this.api
                .post(PORTAL_MENU_LANG_ENDPOINT.GET_LIST_PORTAL_MENU, params)
                .subscribe(
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

    openDialog(type?: string, item?: any) {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để thêm mới');
            return;
        }
        let titleType: string;
        if (type === 'update') {
            titleType = 'Cập nhật thông tin';
        } else if (type === 'detail') {
            titleType = 'Xem chi tiết bản ghi';
        } else {
            titleType = 'Thông tin thêm mới';
        }
        let param: object = {
            title: titleType,
            type: type,
            item: item ? item : null,
            portalCode: this.portalCode,
            lstLangByPortal: this.lstLangByPortal,
            namePortal: this.namePortal,
        };
        const dialogRef = this.dialog.open(PortalMenuDialogComponent, {
            disableClose: true,
            width: '60%',
            data: param,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    changeActiveStatus(item: any) {
        if (item) {
            this.api
                .post(PORTAL_MENU_LANG_ENDPOINT.CHANGE_ACTIVITIES, item['id'])
                .subscribe(
                    (res) => {
                        this.loading = false;
                        if (res.data == true) {
                            this.toast.showSuccess(
                                'Chuyển trạng thái thành công!'
                            );
                            this.doSearch();
                        } else {
                            this.toast.showWarning(
                                'Chuyển trạng thái không thành công!'
                            );
                        }
                    },
                    (error) => {
                        this.toast.showError(
                            error.message ? error.message : error
                        );
                    }
                );
        } else {
            this.toast.showWarning('MENU không tồn tại');
        }
    }

    onDelete(item: any): any {
        let param: Object = {
            title: 'Xác nhận xóa',
            message:
                'Bạn có muốn xóa dữ liệu <strong>' +
                item['menuCode'] +
                '</strong>?',
        };
        this.dialog
            .open(DialogCommonComponent, {
                width: '20%',
                data: param,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                let params: Object = {
                    id: item['id'],
                    isActive: item['isActive'],
                };
                if (result && result['rs'] === true) {
                    this.loading = true;
                    this.api
                        .post(PORTAL_MENU_LANG_ENDPOINT.DELETE, params)
                        .subscribe(
                            (res) => {
                                if (res.data === true) {
                                    this.toast.showSuccess(
                                        'Thông báo',
                                        'Xóa dữ liệu thành công!'
                                    );
                                    this.doSearch(0);
                                } else {
                                    this.toast.showWarning(
                                        'Thông báo',
                                        'Xóa dữ liệu không thành công, mã menu đang được sử dụng!'
                                    );
                                }
                                this.loading = false;
                            },
                            () => {
                                this.loading = false;
                            }
                        );
                }
            });
    }
}
