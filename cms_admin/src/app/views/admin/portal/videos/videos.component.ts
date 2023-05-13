import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import * as moment from 'moment';
import {ARTICLE_GROUP, LANGUAGE_ENDPOINT, PORTAL_INFO_ENDPOINT, VIDEOS} from 'src/app/common/enum/EApiUrl';
import {EICON_TYPE} from 'src/app/common/enum/EType';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {ArticleDialogComponent} from 'src/app/views/article-detail-info/article-dialog/article-dialog.component';
import {ArticlePreviewPortalComponent} from 'src/app/views/article-preview-portal/article-preview-portal.component';
import {VideosDialogComponent} from './videos-dialog/videos-dialog.component';

@Component({
    selector: 'app-videos',
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit {

    loading: boolean = false;

    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;

    dataList: any = [];
    tableColumns: any = [
        {
            name: 'langName',
            label: 'Ngôn ngữ',
            options: {
                width: '10%',
                customBodyRender: (value: any, obj: any, index: number) => {
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
            name: 'videosDescription',
            label: 'Mô tả',
            options: {
                customBodyRender: (value: any) => {
                    let msg = value;
                    if (value && value.length > 120) {
                        msg = value.substring(0, 100);
                        msg += '.......';
                    }
                    return msg;
                },
            },
        },
        {
            name: 'videosCreateBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'videosCreateDate',
            label: 'Ngày tạo',
            options: {
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'videosIsActive',
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
            name: 'approvedStatus',
            label: 'Trạng thái phê duyệt',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    let msg;
                    let strHtml = '<span';
                    if (value === 0) {
                        strHtml += ' class="status-draf" ';
                        msg = 'Tạo nháp';
                    } else if (value === 1) {
                        strHtml += ' class="status-wait" ';
                        msg = 'Chờ duyệt';
                    } else if (value === 2) {
                        strHtml += ' class="status-approved" ';
                        msg = 'Đã duyệt';
                    } else {
                        strHtml += ' class="status-error" ';
                        msg = 'Từ chối duyệt';
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
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Chỉnh sửa',
            doAction: (item: any) => {
                this.doEdit(item);
            },
        },
    ];

    //tieu chi tim kiem
    lstPortal: any = [];
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];
    lstActiveStatus: any = [
        {name: '---Tất cả---', value: -1},
        {name: 'Đang hoạt động', value: 1},
        {name: 'Không hoạt động', value: 0},
    ];
    lstApprovedStatus: any = [
        {name: '---Tất cả---', value: -1},
        {name: 'Tạo nháp', value: 0},
        {name: 'Chờ duyệt', value: 1},
        {name: 'Đã duyệt', value: 2},
        {name: 'Từ chối duyệt', value: 3},
    ];
    portalCode!: string;
    langCode!: string;
    videosIsActive: number = -1;
    approveStatus: number = -1;

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        this.getAllPortal();
        this.doSearch();
    }

    doSearch(pageInfo?: any): any {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để tìm kiếm');
            return;
        }

        this.loading = true;

        if (pageInfo) {
            this.page = pageInfo['page'];
            this.pageSize = pageInfo['pageSize'];
        }

        let param = {
            videosPortalCode: this.portalCode || null,
            langCode: this.langCode || null,
            videosIsActive: this.videosIsActive,
            approvedStatus: this.approveStatus,
            page: this.page,
            size: this.pageSize,
        };
        this.api.post(VIDEOS.SEARCH_VIDEOS, param).subscribe(
            (res) => {
                this.dataList = res['data']['list'];
                this.totalItems = res['data']['count'];
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe(
            (res) => {
                this.lstPortal = res['data'];
                this.loading = false;
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
    }

    onChangeLang(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.GET_BY_PORTAL, {
                    portalCode: this.portalCode,
                    langCode: value,
                })
                .subscribe(
                    (res) => {
                        this.lstArticleGroup = res['data'];
                        this.loading = false;
                    },
                    () => {
                        this.loading = false;
                    }
                );
        }
        this.doSearch();
    }

    doDialog() {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để tìm kiếm');
            return;
        }
        let params: object = {
            title: 'Thêm mới video',
            portalCode: this.portalCode,
        };

        const dialogRef = this.dialog.open(VideosDialogComponent, {
            width: '80%',
            data: params,
            disableClose:true
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    doEdit(item: any) {
        if (item['approvedStatus'] !== 0) {
            this.toast.showWarning(
                'Thông báo',
                'Không có quyền truy cập thao tác'
            );
            return;
        }

        let params: object = {
            title: 'Chỉnh sửa video',
            langCode: item['langCode'],
            articleId: item['articleId'],
            portalCode: this.portalCode,
        };

        const dialogRef = this.dialog.open(ArticleDialogComponent, {
            width: '80%',
            data: params,
            disableClose:true
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    doPreview(item: any) {
        let params: object = {
            title: 'Xem trước video',
            langCode: item['langCode'],
            articleId: item['articleId'],
            portalCode: this.portalCode,
        };

        const dialogRef = this.dialog.open(ArticlePreviewPortalComponent, {
            width: '80%',
            data: params,
            disableClose:true
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }
}
