import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
    ARTICLE_DETAIL,
    ARTICLE_DETAIL_LANG,
    ARTICLE_GROUP,
    LANGUAGE_ENDPOINT,
    PORTAL_INFO_ENDPOINT,
} from 'src/app/common/enum/EApiUrl';
import { ERole } from 'src/app/common/enum/ERole';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { AuthService } from 'src/app/common/services/auth/auth.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { ArticlePreviewPortalComponent } from './../article-preview-portal/article-preview-portal.component';
import { ArticleDetailFeedbackComponent } from './article-detail-feedback/article-detail-feedback.component';
import { ArticleDialogComponent } from './article-dialog/article-dialog.component';
import { ArticleTimelineComponent } from './article-timeline/article-timeline.component';

@Component({
    selector: 'app-article-detail-info',
    templateUrl: './article-detail-info.component.html',
    styleUrls: ['./article-detail-info.component.scss'],
})
export class ArticleDetailInfoComponent implements OnInit {
    loading: boolean = false;

    searchAdvance = false;

    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;

    type: number = 1;
    groupCode!: any;
    portalCode: any = 'VDSS';
    langCode: any = 'VI';

    disable: boolean = false;

    dataList: any = [];
    menuCode!: string;
    listGroupCode: any = [];
    tableColumns: any = [
        {
            name: 'langName',
            label: 'Ngôn ngữ',
            options: {
                width: '10%',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml =
                        '<img class="logo-icon" src="data:image/jpg;base64,';
                    strHtml += obj['langIcon'];
                    strHtml += '"/>&nbsp;&nbsp;';
                    strHtml += value;
                    return strHtml;
                },
            },
        },
        {
            name: 'groupName',
            label: 'Chuyên đề bài viết',
        },
        {
            name: 'articleCode',
            label: 'Mã bài viết',
            options: {
                align: 'text-center',
                with: '8%',
            },
        },
        {
            name: 'articleTitle',
            label: 'Tên bài viết',
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
            name: 'articleSource',
            label: 'Nguồn bài viết',
            options: {
                align: 'text-center',
                width: '10%',
            },
        },
        {
            name: 'authorName',
            label: 'Tác giả',
            options: {
                align: 'text-center',
                width: '8%',
            },
        },
        {
            name: 'articleCreateBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'articleCreateDate',
            label: 'Ngày tạo',
            options: {
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'articleIsActive',
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
                    } else if (value === 4) {
                        strHtml += ' class="status-success" ';
                        msg = 'Xuất bản';
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
            icon: 'cilHistory',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xem lịch sử',
            doAction: (item: any) => {
                this.getHistoryArticle(item);
            },
        },
        {
            icon: 'cilZoom',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xem trước bài viết',
            doAction: (item: any) => {
                this.doPreview(item);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Chỉnh sửa',
            display: (obj: any) => {
                let rs = false;
                if (
                    this.roleAdmin ||
                    obj['approvedStatus'] === 0 ||
                    obj['approvedStatus'] === 3
                ) {
                    rs = true;
                }
                return rs;
            },
            doAction: (item: any) => {
                this.doEdit(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xóa bài viết',
            display: (obj: any) => {
                let rs = false;
                if (
                    this.roleAdmin ||
                    obj['approvedStatus'] === 0 ||
                    obj['approvedStatus'] === 3
                ) {
                    rs = true;
                }
                return rs;
            },
            doAction: (item: any) => {
                this.onDelete(item);
            },
        },
        {
            iconType: EICON_TYPE.CORE_UI,
            customIcon: (obj: any) => {
                return obj['articleIsActive'] === 0
                    ? 'cilCheckCircle'
                    : 'cilBan';
            },
            customTooltip: (obj: any) => {
                return obj['articleIsActive'] === 0
                    ? 'Đang hoạt động'
                    : 'Không hoạt động';
            },
            doAction: (item: any) => {
                this.changeActiveStatus(item);
            },
            display: (obj: any) => {
                let rs = false;
                if (
                    this.roleAdmin ||
                    obj['approvedStatus'] === 0 ||
                    obj['approvedStatus'] === 3
                ) {
                    rs = true;
                }
                return rs;
            },
        },
        {
            icon: 'cilClipboard',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Sao chép bài viết',
            doAction: (item: any) => {
                this.doDuplicate(item);
            },
        },
    ];

    //tieu chi tim kiem
    authorName?: string;
    articleCode?: string;
    fromDate?: String;
    toDate?: String;
    lstPortal: any = [];
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];
    lstMenuCode: any = [];
    lstActiveStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Đang hoạt động', value: 1 },
        { name: 'Không hoạt động', value: 0 },
    ];
    lstApprovedStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Tạo nháp', value: 0 },
        { name: 'Chờ duyệt', value: 1 },
        { name: 'Đã duyệt', value: 2 },
        { name: 'Từ chối duyệt', value: 3 },
        { name: 'Xuất bản', value: 4 },
    ];

    activeStatus: number = -1;
    approveStatus: number = -1;
    roleAdmin: boolean = false;

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private auth: AuthService
    ) {}

    ngOnInit(): void {
        let userInfo = this.auth.getUserInfo();
        this.roleAdmin = _.includes(userInfo['authorities'], ERole.ADMIN);
        this.getAllPortal();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
            {
                if (this.langCode) {
                    this.onChangeLang(this.langCode);
                }
            }
        }
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
            portalCode: this.portalCode,
            langCode: this.langCode,
            groupCode: this.groupCode,
            menuCode: this.menuCode,
            activeStatus: this.activeStatus,
            approveStatus: this.approveStatus,
            articleCode: this.articleCode,
            fromDate: this.fromDate,
            toDate: this.toDate,
            type: this.type,
            page: this.page,
            size: this.pageSize,
            // flowStatus: null,
            // listGroupCode: []
            listGroupCode: [],
            // listGroupCode: this.listGroupCode,
            authorName: this.authorName,
        };
        this.api.post(ARTICLE_GROUP.SEARCH, param).subscribe({
            next: (res) => {
                this.dataList = res['data']['list'];
                this.totalItems = res['data']['count'];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            },
        });
    }

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe({
            next: (res) => {
                this.lstPortal = res['data'];
                this.loading = false;
                // this.portalCode = '';
            },
            error: () => {
                this.loading = false;
            },
        });
    }

    onChangePortal(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, {
                    portalCode: value,
                })
                .subscribe({
                    next: (res) => {
                        this.lstLangByPortal = res['data'];
                        this.groupCode = null;
                        this.lstArticleGroup = [];
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        } else {
            // this.langCode = null;
            this.lstLangByPortal = [];
            this.groupCode = null;
            this.lstArticleGroup = [];
        }
        this.doSearch();
    }

    onChangeLang(value: any) {
        if (value) {
            this.loading = true;
            let param = {
                portalCode: this.portalCode,
                langCode: value,
            };
            this.api
                .post(ARTICLE_GROUP.LIST_MENU_BY_PORTAL_AND_LANG, param)
                .subscribe({
                    next: (res) => {
                        this.lstMenuCode = res['data'];
                        this.lstMenuCode.forEach((obj: any, index: number) => {
                            this.lstMenuCode[index]['name'] = obj.name.replace(
                                /<br>/g,
                                ' '
                            );
                        });
                        this.groupCode = null;
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        } else {
            this.groupCode = null;
            this.lstMenuCode = [];
        }
        this.doSearch();
    }

    onChangeSearch() {
        this.doSearch();
    }

    doDuplicate(item: any) {
        const params: object = {
            title: 'Thêm mới bài viết',
            langCode: item['langCode'],
            articleId: item['articleId'],
            articleDetailLangId: item['articleDetailLangId'],
            portalCode: this.portalCode,
            approvedStatus: item['approvedStatus'],
            roleAdmin: this.roleAdmin,
            isClone: true,
        };

        const dialogRef = this.dialog.open(ArticleDialogComponent, {
            width: '80%',
            data: params,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((param) => {
            this.doSearch();
        });
    }

    doDialog() {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để thêm mới');
            return;
        }
        let params: object = {
            title: 'Thêm mới bài viết',
            portalCode: this.portalCode,
        };
        const dialogRef = this.dialog.open(ArticleDialogComponent, {
            width: '80%',
            data: params,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((param) => {
            this.doSearch();
        });
    }

    doEdit(item: any) {
        let params: object = {
            title: 'Cập nhật bài viết',
            langCode: item['langCode'],
            articleId: item['articleId'],
            articleDetailLangId: item['articleDetailLangId'],
            portalCode: this.portalCode,
            approvedStatus: item['approvedStatus'],
            roleAdmin: this.roleAdmin,
        };

        const dialogRef = this.dialog.open(ArticleDialogComponent, {
            width: '80%',
            data: params,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((param) => {
            this.doSearch();
        });
    }

    doPreview(item: any) {
        let params: object = {
            title: 'Xem trước bài viết',
            langCode: item['langCode'],
            articleId: item['articleId'],
            articleDetailLangId: item['articleDetailLangId'],
            portalCode: this.portalCode,
            isView: true,
        };
        const dialogRef = this.dialog.open(ArticlePreviewPortalComponent, {
            width: '80%',
            data: params,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((param) => {
            this.doSearch();
        });
    }

    getHistoryArticle(item: any) {
        let params: object = {
            title: 'Lịch sử bài viết',
            articleId: item['articleDetailLangId'],
        };
        const dialogRef = this.dialog.open(ArticleTimelineComponent, {
            width: '50%',
            data: params,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    doGetFeedback(item: any) {
        let params: object = {
            title: 'Thông tin phản hồi',
            langCode: item['langCode'],
            articleId: item['articleDetailLangId'],
            portalCode: this.portalCode,
        };

        const dialogRef = this.dialog.open(ArticleDetailFeedbackComponent, {
            width: '62%',
            data: params,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    onDelete(item: any): any {
        //check before delete
        if (!this.roleAdmin && item['approvedStatus'] !== 0) {
            this.toast.showWarning(
                'Thông báo',
                'Không có quyền thực hiện thao tác này'
            );
            return;
        }

        let params: Object = {
            title: 'Xác nhận',
            message:
                'Bạn có chắc chắn muốn xóa bài viết có mã: <strong>' +
                item['articleCode'] +
                '</strong>?',
        };
        if (
            item['approvedStatus'] != 1 &&
            item['approvedStatus'] != 2 &&
            item['approvedStatus'] != 4
        ) {
            this.dialog
                .open(DialogCommonComponent, {
                    width: '25%',
                    data: params,
                    disableClose: true,
                })
                .afterClosed()
                .subscribe((result) => {
                    if (result && result['rs'] === true) {
                        this.api
                            .post(ARTICLE_DETAIL_LANG.DELETE, item)
                            .subscribe({
                                next: (res) => {
                                    if (res.data == true) {
                                        this.toast.showSuccess(
                                            'Xóa bài viết thành công!'
                                        );
                                    }
                                    this.loading = false;
                                    this.doSearch();
                                },
                                error: (error) => {
                                    this.toast.showError(
                                        error.message ? error.message : error
                                    );
                                },
                            });
                    }
                });
        } else {
            this.toast.showWarning('Bài viết hiện không xóa được!');
        }
    }

    changeActiveStatus(item: any) {
        //check before change status
        if (!this.roleAdmin && item['approvedStatus'] !== 0) {
            this.toast.showWarning(
                'Thông báo',
                'Không có quyền thực hiện thao tác này'
            );
            return;
        }
        this.api.post(ARTICLE_DETAIL_LANG.CHANGE_ACTIVE, item).subscribe({
            next: (res) => {
                if (res.data == true) {
                    this.toast.showSuccess('Chuyển trạng thái thành công!');
                }
                this.doSearch();
            },
            error: (error) => {
                this.toast.showError(error.message ? error.message : error);
            },
        });
    }

    onChangeGroupCode(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.LIST_ACTICLE_GROUP_SUB, {
                    portalCode: this.portalCode,
                    langCode: this.langCode,
                    menuCode: value,
                })
                .subscribe({
                    next: (res) => {
                        this.lstArticleGroup = res['data'];
                        this.listGroupCode.length = 0;
                        this.lstArticleGroup.forEach((obj: any) => {
                            this.listGroupCode.push(obj.groupCode);
                        });
                        this.doSearch();
                        this.groupCode = null;
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        } else {
            this.groupCode = null;
            this.lstArticleGroup = [];
            this.listGroupCode.length = 0;
            this.doSearch();
        }
    }

    onChangeSubGroupCode() {
        this.listGroupCode.length = 0;
        this.listGroupCode.push(this.groupCode);
        this.doSearch();
    }
}
