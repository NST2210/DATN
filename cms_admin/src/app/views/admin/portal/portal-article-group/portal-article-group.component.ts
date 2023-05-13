import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FetchApiService } from '../../../../common/services/api/fetch-api.service';
import { ToastNotiService } from '../../../../common/services/toastr/toast-noti.service';
import {
    ARTICLE_GROUP,
    LANGUAGE_ENDPOINT,
    PORTAL_INFO_ENDPOINT,
} from '../../../../common/enum/EApiUrl';
import * as moment from 'moment';
import { EICON_TYPE } from '../../../../common/enum/EType';
import { PortalArticleGroupDialogComponent } from './portal-article-group-dialog/portal-article-group-dialog.component';
import { DialogCommonComponent } from '../../../../common/GUI/dialog-common/dialog-common.component';

@Component({
    selector: 'app-portal-article-group',
    templateUrl: './portal-article-group.component.html',
    styleUrls: ['./portal-article-group.component.scss'],
})
export class PortalArticleGroupComponent implements OnInit {
    loading: boolean = false;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    portalCode: string = 'VDSS';
    portalName!: string;
    lstPortal: any = [];
    lstLangByPortal: any = [];
    lstMenuByPortalAndLang: any = [];
    menuCode!: string;
    isActive!: string;
    langCode: string = 'VI';
    form!: FormGroup;
    dataList: any = [];
    lstArticleGroup: any = [];
    lstActiveStatus: any = [
        { name: '---Tất cả---', value: null },
        { name: 'Đang hoạt động', value: 1 },
        { name: 'Không hoạt động', value: 0 },
    ];

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã chuyên đề bài viết',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'content',
            label: 'Chuyên đề',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'description',
            label: 'Mô tả',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'menuName',
            label: 'Chuyên mục',
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
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xoá chuyên mục bài viết',
            doAction: (item: any) => {
                this.onDelete(item);
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
    ];

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.getAllPortal();
        this.buildForm();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
            if (this.langCode) {
                this.onChangeLang(this.langCode);
            }
        }
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            code: ['', Validators.maxLength(30)],
        });
    }
    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe(
            (res) => {
                this.lstPortal = res['data'];
                this.lstPortal.find((obj: any) => {
                    if (obj['code'] === this.portalCode) {
                        this.portalName = obj['description'];
                    }
                });
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }

    onChangePortal(value: any) {
        this.lstPortal.find((obj: any) => {
            if (obj['code'] === value) {
                this.portalName = obj['description'];
            }
        });
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
    }

    onChangeMenuCode() {
        this.doSearch();
    }

    doSearch(pageInfo?: any) {
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
                langCode: this.langCode,
                menuCode: this.menuCode,
                code: this.form.controls['code'].value,
                isActive: this.isActive,
                page: this.page,
                size: this.pageSize,
                groupCode: null,
                groupType: null,
                displayOrder: null,
                content: null,
                displayHome: null,
                lstArticleCategoryByMenu: [],
            };
            this.api.post(ARTICLE_GROUP.SEARCH_FOR_PORTAL, params).subscribe({
                next: (res) => {
                    this.dataList = res.data['list'];
                    this.totalItems = res.data['count'];
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
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
            portalName: this.portalName,
            menuCode: this.menuCode,
            lstLangByPortal: this.lstLangByPortal,
            displayImg: item,
        };
        const dialogRef = this.dialog.open(PortalArticleGroupDialogComponent, {
            width: '60%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    onDelete(item: any): any {
        let param: Object = {
            title: 'Xác nhận xóa',
            message:
                'Bạn có muốn xóa dữ liệu <strong>' +
                item['code'] +
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
                        .post(ARTICLE_GROUP.DELETE, params)
                        .subscribe((res) => {
                            this.loading = false;
                            if (res.data === true) {
                                this.toast.showSuccess(
                                    'Thông báo',
                                    'Xóa dữ liệu thành công!'
                                );
                                this.doSearch();
                            } else {
                                this.toast.showWarning(
                                    'Thông báo',
                                    'Xóa dữ liệu không thành công, Chuyên mục bài viết đang được sử dụng!'
                                );
                            }
                        });
                }
            });
    }

    changeActiveStatus(item: any) {
        this.api.post(ARTICLE_GROUP.CHANGE_ACTIVE, item).subscribe(
            (res) => {
                this.loading = false;
                if (res.data == true) {
                    this.toast.showSuccess('Chuyển trạng thái thành công!');
                    this.doSearch();
                } else {
                    this.toast.showWarning(
                        'Chuyển trạng thái không thành công!'
                    );
                }
            },
            (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }

    onChangeLang(value: any) {
        if (value) {
            this.loading = true;
            let params: object = {
                portalCode: this.portalCode,
                langCode: value ? value : '',
            };
            this.api
                .post(ARTICLE_GROUP.LIST_MENU_BY_PORTAL_AND_LANG, params)
                .subscribe(
                    (res) => {
                        this.loading = false;
                        if (res['data'] && res['data'].length > 0) {
                            this.lstMenuByPortalAndLang = res['data'];
                            this.lstMenuByPortalAndLang.forEach((item: any) => {
                                item.name = item.name.replace(
                                    /<br\s*\/?>/gi,
                                    ' '
                                );
                            });
                            this.doSearch();
                        } else {
                            this.lstMenuByPortalAndLang = [];
                        }
                    },
                    (error) => {
                        this.loading = false;
                        this.toast.showError(
                            error.message ? error.message : error
                        );
                    }
                );
        } else {
            this.lstMenuByPortalAndLang = [];
        }
    }
}
