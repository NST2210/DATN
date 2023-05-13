import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    LANGUAGE_ENDPOINT,
    PORTAL_INFO_ENDPOINT,
    PORTAL_INTRODUCE,
} from 'src/app/common/enum/EApiUrl';
import { EACTIVE } from 'src/app/common/enum/EStatus';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { PortalIntroduceDialogComponent } from './portal-introduce-dialog/portal-introduce-dialog.component';

@Component({
    selector: 'app-portal-introduce',
    templateUrl: './portal-introduce.component.html',
    styleUrls: ['./portal-introduce.component.scss'],
})
export class PortalIntroduceComponent implements OnInit {
    dataLang: any = [];
    status: number = -1;
    loading: boolean = false;
    page: number = 0;
    pageSize: number = 10;
    totalItems: number = 0;
    form!: FormGroup;
    dataList: any = [];
    lstPortal: any = [];
    portalCode: string = 'VDSS';
    lstLangByPortal: any = [];
    langCode: string = 'VI';

    lstStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Đang hoạt động', value: 1 },
        { name: 'Không hoạt động', value: 0 },
    ];

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã Intro',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'title',
            label: 'Tên Intro',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'langCode',
            label: 'Ngôn ngữ',
            options: {
                align: 'text-center',
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
            tooltip: 'Sửa intro',
            doAction: (item: any) => {
                this.doOpenDialog(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xóa intro',
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
        this.getAllPortal();
        this.doSearch();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode, true);
            if (this.langCode) {
                this.onChangeLang(true);
            }
        }
    }

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe({
            next: (res) => {
                this.lstPortal = res['data'];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            },
        });
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            title: ['', Validators.maxLength(70)],
            code: ['', Validators.maxLength(30)],
            portalCode: ['', Validators.maxLength(30)],
        });
    }

    doSearch(pageInfo?: any): any {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để tìm kiếm');
            return;
        }
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
                portalCode: this.portalCode,
                langCode: this.langCode,
                code: this.form.controls['code'].value,
                title: this.form.controls['title'].value,
                status: this.status,
                page: this.page,
                size: this.pageSize,
            };
            this.api.post(PORTAL_INTRODUCE.SEARCH, param).subscribe({
                next: (res) => {
                    this.dataList = res.data['list'];
                    this.totalItems = res.data['count'];
                    if (this.totalItems <= param['size']) {
                        this.page = 0;
                    }
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
        }
    }

    doOpenDialog(item: any): any {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để thêm mới');
            return;
        }
        let param: object = {
            item,
            title: item?.title
                ? 'Cập nhật thông tin Intro'
                : 'Thêm mới thông tin Intro',
            langId: item ? item['id'] : null,
            portalCode: this.portalCode,
            lstLangByPortal: this.lstLangByPortal,
        };

        const dialogRef = this.dialog.open(PortalIntroduceDialogComponent, {
            width: '50%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    onChangePortal(value: any, isInit = false) {
        this.lstPortal.find((obj: any) => {
            if (obj['code'] === value) {
                this.portalCode = obj['description'];
            }
        });
        if (value) {
            this.loading = true;
            this.api
                .get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, {
                    portalCode: value,
                })
                .subscribe({
                    next: (res) => {
                        this.lstLangByPortal = res['data'];
                        this.loading = false;
                        if (!isInit) {
                            this.doSearch();
                        }
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        }
    }

    onChangeLang(isInit = false) {
        if (!isInit) {
            this.doSearch();
        }
    }

    doDeleted(item: any): any {
        let param: Object = {
            title: 'Xác nhận xóa',
            message:
                'Bạn có muốn xóa thông tin intro <strong>' +
                item['title'] +
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
            .post(PORTAL_INTRODUCE.DELETE, null, {
                langId: langId,
                activeStatus: activeStatus,
            })
            .subscribe({
                next: (res) => {
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
                error: () => {
                    this.loading = false;
                },
            });
    }
}
