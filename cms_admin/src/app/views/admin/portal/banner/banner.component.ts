import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FetchApiService } from '../../../../common/services/api/fetch-api.service';
import { ToastNotiService } from '../../../../common/services/toastr/toast-noti.service';
import {
    BANNER,
    LANGUAGE_ENDPOINT,
    PORTAL_INFO_ENDPOINT,
} from '../../../../common/enum/EApiUrl';
import * as moment from 'moment';
import { EICON_TYPE } from '../../../../common/enum/EType';
import { DialogCommonComponent } from '../../../../common/GUI/dialog-common/dialog-common.component';
import { BannerDialogComponent } from './banner-dialog/banner-dialog.component';
import { ImagePreviewComponent } from 'src/app/common/GUI/image-preview/image-preview.component';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
    loading: boolean = false;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    portalCode: string = 'TCCAND';
    portalName!: string;
    lstPortal: any = [];
    lstLangByPortal: any = [];
    isActive!: number;
    langCode: string = 'VI';
    fileType!: number;
    dataList: any = [];
    isDisabled = true;
    approve!: number;

    lstActiveStatus: any = [
        { name: '---Tất cả---', value: null },
        { name: 'Đang hoạt động', value: 1 },
        { name: 'Không hoạt động', value: 0 },
    ];
    lstBanner: any = [
        { name: '---Tất cả---', value: null },
        { name: 'Banner', value: 0 },
        { name: 'Ảnh quảng cáo', value: 1 },
    ];

    tableColumns: any = [
        {
            name: 'langName',
            label: 'Ngôn ngữ',
            options: {
                width: '10%',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml =
                        '<img class="lang-icon" src="data:image/jpg;base64,';
                    strHtml += obj['langIcon'];
                    strHtml += '"/>&nbsp;&nbsp;';
                    strHtml += value;
                    return strHtml;
                },
            },
        },
        {
            name: 'pathStorage',
            label: 'Ảnh quảng cáo/banner',
            options: {
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml1 = '';
                    strHtml1 =
                        '<img class="image-display" src="data:image/jpg;base64,';
                    strHtml1 += obj['pathStorage'];
                    strHtml1 += '"/>&nbsp;&nbsp;';

                    return strHtml1;
                },
            },
        },
        {
            name: 'fileType',
            label: 'Thể loại',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value === 1 ? 'Ảnh quảng cáo' : 'Banner';
                },
            },
        },
        {
            name: 'createBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'createDate',
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
        {
            name: 'approve',
            label: 'Trạng thái phê duyệt',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    let strHtml = '<span';
                    let msg;
                    if (value === 4) {
                        strHtml += ' class="status-success" ';
                        msg = 'Đã xuất bản';
                    } else {
                        strHtml += ' class="status-wait" ';
                        msg = 'Chưa xuất bản';
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
                this.doPreview(item);
            },
        },
        {
            icon: 'cilShareBoxed',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xuất bản',
            doAction: (item: any) => {
                this.doPublicBanner(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xoá ảnh quảng cáo / banner',
            doAction: (item: any) => {
                this.doDelete(item);
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
                this.doChangeStatus(item);
            },
        },
    ];

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {}

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

    doSearch(pageInfo?: any) {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để tìm kiếm');
            return;
        }
        if (pageInfo) {
            this.page = pageInfo['page'];
            this.pageSize = pageInfo['pageSize'];
        }
        this.loading = true;
        let params = {
            portalCode: this.portalCode,
            langCode: this.langCode,
            isActive: this.isActive,
            fileType: this.fileType,
            approve: this.approve,
            page: this.page,
            size: this.pageSize,
        };
        this.api.post(BANNER.SEARCH_DATA, params).subscribe(
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
            lstLangByPortal: this.lstLangByPortal,
            formType: type,
        };
        this.isDisabled = false;
        const dialogRef = this.dialog.open(BannerDialogComponent, {
            width: '60%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    doDelete(item: any) {
        if (item.approve == 4) {
            this.toast.showWarning('Thông báo', 'Ảnh/Banner đã được xuất bản!');
            return;
        }
        let params: Object = {
            title: 'Xác nhận',
            message:
                item.fileType == 1
                    ? 'Bạn có chắc chắn muốn xóa ảnh này'
                    : 'Bạn có chắc chắn xóa banner này',
        };
        this.dialog
            .open(DialogCommonComponent, {
                width: '25%',
                data: params,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result && result['rs'] === true) {
                    this.loading = true;
                    this.api
                        .post(BANNER.DELETE, null, {
                            id: item['id'],
                            changeStatus: 2,
                        })
                        .subscribe(
                            (res) => {
                                this.loading = false;
                                if (res.data === true) {
                                    this.toast.showSuccess(
                                        'Thông báo',
                                        'Xóa thành công!'
                                    );
                                    this.doSearch();
                                }
                            },
                            (error) => {
                                this.loading = false;
                                this.toast.showError(
                                    error.message ? error.message : error
                                );
                            }
                        );
                }
            });
    }

    doChangeStatus(item: any) {
        this.loading = true;
        let changeStatus: number;
        if (item.isActive === 1) {
            changeStatus = 0;
        } else {
            changeStatus = 1;
        }
        this.api
            .post(BANNER.DELETE, null, {
                id: item['id'],
                changeStatus: changeStatus,
            })
            .subscribe(
                (res) => {
                    this.loading = false;
                    if (res.data === true) {
                        this.toast.showSuccess(
                            'Thông báo',
                            'Cập nhật trạng thái thành công!'
                        );
                        this.doSearch();
                    }
                },
                (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                }
            );
    }
    doPreview(item: any) {
        let params = {
            fileContent: item.pathStorage,
        };
        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: params,
            disableClose: true,
        });
    }
    doPublicBanner(item: any) {
        if (item.approve == 4) {
            this.toast.showWarning('Thông báo', 'Ảnh đã được xuất bản!');
            return;
        }
        let params: Object = {
            title: 'Xác nhận',
            message:
                item.fileType == 1
                    ? 'Bạn có chắc chắn muốn xuất bản ảnh này'
                    : 'Bạn có chắc chắn xuất bản banner này',
        };
        this.dialog
            .open(DialogCommonComponent, {
                width: '25%',
                data: params,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result && result['rs'] === true) {
                    this.loading = true;
                    this.api
                        .post(BANNER.PUBLIC, null, {
                            id: item['id'],
                        })
                        .subscribe(
                            (res) => {
                                this.loading = false;
                                if (res.data === true) {
                                    this.toast.showSuccess(
                                        'Thông báo',
                                        'Xuất bản thành công!'
                                    );
                                    this.doSearch();
                                }
                            },
                            (error) => {
                                this.loading = false;
                                this.toast.showError(
                                    error.message ? error.message : error
                                );
                            }
                        );
                }
            });
    }
    onChangeType(value: any) {
        this.fileType = value;
        this.doSearch();
    }
    onChangeActive(value: any) {
        this.isActive = value;
        this.doSearch();
    }
}
