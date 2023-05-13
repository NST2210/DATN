import { ArticleSwitchUserComponent } from './article-switch-user/article-switch-user.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
    ARTICLE_DETAIL,
    ARTICLE_GROUP,
    LANGUAGE_ENDPOINT,
    PORTAL_FLOW,
    PORTAL_INFO_ENDPOINT,
} from 'src/app/common/enum/EApiUrl';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { ArticleTimelineComponent } from '../article-detail-info/article-timeline/article-timeline.component';
import { ArticlePreviewPortalComponent } from '../article-preview-portal/article-preview-portal.component';
import { ArticleApproveOrRejectComponent } from './article-approve-or-reject/article-approve-or-reject.component';
import { ArticleDialogComponent } from '../article-detail-info/article-dialog/article-dialog.component';

@Component({
    selector: 'app-article-approve',
    templateUrl: './article-approve.component.html',
    styleUrls: ['./article-approve.component.scss'],
})
export class ArticleApproveComponent implements OnInit {
    loading: boolean = false;

    searchAdvance: boolean = false;
    dataList: any = [];
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    portalCode: string ='VDSS';
    langCode: string='VI';
    groupCode!: any;
    articleDetailLangId!: string;
    approveStatus: number = -1;
    flowStatus: number = -1;
    flowStepCurrent!: any;
    lstPortal: any = [];
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];
    listGroupCode: any = [];
    lstMenuCode: any = [];
    menuCode!: string;
    lstApprovedStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Chờ duyệt', value: 2 },
        { name: 'Đã duyệt', value: 1 },
        { name: 'Từ chối duyệt', value: 0 },
    ];
    lstFlowStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Chờ duyệt', value: 2 },
        { name: 'Đã duyệt', value: 1 },
        { name: 'Từ chối duyệt', value: 0 },
    ];
    articleCode?: string;
    fromDate?: Date;
    toDate?: Date;
    item?: String;
    createBy?:string;
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
            name: 'groupName',
            label: 'Chuyên đề bài viết',
        },
        {
            name: 'articleCode',
            label: 'Mã bài viết',
            options: {
                align: 'text-center',
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
            name: 'flowStatus',
            label: 'Trạng thái phê duyệt',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let msg;
                    let strHtml = '<span';
                    if (value === 1) {
                        strHtml += ' class="status-approved" ';
                        msg = 'Đã duyệt';
                    } else if (value === 0) {
                        strHtml += ' class="status-error" ';
                        msg = 'Từ chối duyệt';
                    } else {
                        strHtml += ' class="status-wait" ';
                        msg = 'Chờ duyệt';
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
            icon: 'cilCheckCircle',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Duyệt/từ chối bài viết',
            doAction: (item: any) => {
                this.doApproveOrReject(item);
            },
        },
        {
            icon: 'fa fa-users',
            iconType: EICON_TYPE.FONT_AWESOME,
            tooltip: 'Chuyển người duyệt',
            doAction: (item: any) => {
                this.doSwitchApproved(item);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Chỉnh sửa',
            doAction: (item: any) => {
                if (item) {
                    this.doEdit(item);
                }
            },
        },
    ];

    constructor(
        private api: FetchApiService,
        private toast: ToastNotiService,
        private dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.getAllPortal();
        
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
            if (this.langCode) { 
                this.onChangeLang(this.langCode);
            }
        }
    }

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe(
            (res) => {
                this.lstPortal = res['data'];
                this.loading = false;
                // this.portalCode = '';
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
                        // this.doSearch();
                        // this.doSearch();
                        // this.langCode = '';
                        this.groupCode = '';
                    },
                    () => {
                        this.loading = false;
                    }
                );
        }
    }


    //lấy chuyen muc bài viet
    onChangeLang(value: any) {
        if (value) {
            this.loading = true;
            let param = {
                portalCode: this.portalCode,
                langCode: value,
            }
            this.api
                .post(ARTICLE_GROUP.LIST_MENU_BY_PORTAL_AND_LANG, param)
                .subscribe(
                    (res) => {
                        this.lstMenuCode = res['data'];
                        this.lstMenuCode.forEach((obj: any, index: number) => {
                            this.lstMenuCode[index]['name'] = obj.name.replace(/<br>/g, " ");
                        })
                        this.groupCode = null;
                        this.loading = false;
                    },
                    () => {
                        this.loading = false;
                    }
                );
        } else {
            this.groupCode = null;
            this.lstMenuCode = [];
        }
        this.doSearch();
    }

    onChangeSearch() {
        this.doSearch();
    }

    doSearch(pageInfo?: any) {
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
            activeStatus: -1,
            approveStatus: this.approveStatus,
            type: 3,
            page: this.page,
            size: this.pageSize,
            articleCode: this.articleCode,
            fromDate: this.fromDate,
            toDate: this.toDate,
            flowStatus: this.flowStatus,
            flowStepCurrent: this.flowStepCurrent,
            listGroupCode: this.listGroupCode,
            createBy:this.createBy,
        };
        this.api.post(ARTICLE_GROUP.SEARCH, param).subscribe(
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

    getHistoryArticle(item: any) {
        let params: object = {
            title: 'Lịch sửa bài viết',
            articleId: item['articleDetailLangId'],
        };
        const dialogRef = this.dialog.open(ArticleTimelineComponent, {
            width: '50%',
            data: params,
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    doPreview(item: any) {
        let params: object = {
            title: 'Xem trước bài viết',
            langCode: item['langCode'],
            articleId: item['articleId'],
            portalCode: this.portalCode,
            isView: true,
        };
        const dialogRef = this.dialog.open(ArticlePreviewPortalComponent, {
            width: '80%',
            data: params,
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    doSwitchApproved(item: any) {
        if (item) {
            this.api.get(PORTAL_FLOW.CHECK_FLOW, {
                articleDetailLangId: item['articleDetailLangId'],
            }).subscribe((res) => {
                if (res) {
                    let params: object = {
                        title: 'Chuyển người duyệt',
                        ids:
                            item['articleDetailLangId'],
                        portalCode: this.portalCode,
                    };
                    const dialogRef = this.dialog.open(
                        ArticleSwitchUserComponent,
                        {
                            width: '40%',
                            data: params,
                            disableClose: true
                        }
                    );
                    this.loading = false;
                    dialogRef.afterClosed().subscribe(() => {
                        this.doSearch();
                    });
                } else {
                    this.toast.showWarning(
                        'Thông báo',
                        'Chưa có quyền thao tác'
                    );
                }
            },
                () => {
                }
            );
        }
    }

    doApproveOrReject(item: any) {
        //check step
        if (item) {
            this.loading = true;
            this.api.get(PORTAL_FLOW.CHECK_FLOW, {
                articleDetailLangId: item['articleDetailLangId'],
            }).subscribe((res) => {
                this.loading = false;
                if (res) {
                    let params: object = {
                        title: 'Duyệt/từ chối bài viết',
                        articleDetailLangId: item['articleDetailLangId'],
                    };
                    const dialogRef = this.dialog.open(
                        ArticleApproveOrRejectComponent,
                        {
                            width: '40%',
                            data: params,
                            disableClose: true
                        }
                    );
                    dialogRef.afterClosed().subscribe(() => {
                        this.doSearch();
                    });
                } else {
                    this.toast.showWarning(
                        'Thông báo',
                        'Chưa có quyền thao tác'
                    );
                }
            },
                () => {
                    this.loading = false;
                }
            );
        } else {
            this.toast.showWarning("Không có quyền thao tác với bài viết!")
        }
    }

    doApprovedMulti() {
        let itemCheck: any = _.filter(this.dataList, (obj: any) => {
            return obj['checked'] === true;
        });

        let dataCheck = _.filter(itemCheck, (obj: any) => {
            return obj['flowStatus'] === 1;
        });

        if (dataCheck && dataCheck.length > 0) {
            this.toast.showWarning(
                'Không được phép duyệt bài viết ở trạng thái đã duyệt'
            );
        } else {
            let ids = _.map(itemCheck, 'articleDetailLangId');
            if (ids && ids.length > 0) {
                let params: object = {
                    title: 'Xác nhận',
                    message:
                        'Bạn có chắc chắn muốn phê duyệt <strong>' +
                        ids.length +
                        '</strong> bài viết đã chọn?',
                };

                const dialogRef = this.dialog.open(DialogCommonComponent, {
                    width: '25%',
                    data: params,
                    disableClose: true
                });
                dialogRef.afterClosed().subscribe((result) => {
                    if (result && result['rs'] === true) {
                        this.api.post(ARTICLE_DETAIL.APPROVE_MULTI, null, {
                            ids: ids,
                        }).subscribe((res) => {
                            if (res.data == true) {
                                this.toast.showSuccess(
                                    'Phê duyệt ' + ids.length + ' bài viết thành công!'
                                );
                            }
                            this.doSearch();
                        }, (error) => {
                            this.toast.showError(
                                error.message ? error.message : error
                            );
                        });
                    }
                });
            } else {
                this.toast.showWarning('Vui lòng chọn bài viết cần phê duyệt');
            }
        }
    }

    doSwitchApprovedMulti() {
        let itemCheck: any = _.filter(this.dataList, (obj: any) => {
            return obj['checked'] === true;
        });

        let ids = _.map(itemCheck, 'articleDetailLangId');
        if (ids && ids.length > 0) {
            let params: object = {
                ids: ids,
                portalCode: this.portalCode,
                title: 'Chuyển người duyệt',
            };
            const dialogRef = this.dialog.open(ArticleSwitchUserComponent, {
                width: '40%',
                data: params,
                disableClose: true
            });
            dialogRef.afterClosed().subscribe(() => {
                this.doSearch();
            });
        } else {
            this.toast.showWarning('Vui lòng chọn bài viết cần chuyển người duyệt');
        }
    }

    doEdit(item: any) {
        let params: object = {
            title: 'Cập nhật bài viết',
            langCode: item['langCode'],
            articleId: item['articleId'],
            articleDetailLangId: item['articleDetailLangId'],
            portalCode: this.portalCode,
            approvedStatus: item['approvedStatus'],
            // articleSource:item['articleSource'],
            // keyWord:item['keyWord']
        };

        const dialogRef = this.dialog.open(ArticleDialogComponent, {
            width: '80%',
            data: params,
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }
    //lay danh sach sub groupCode
    onChangeGroupCode(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.LIST_ACTICLE_GROUP_SUB, {
                    portalCode: this.portalCode,
                    langCode: this.langCode,
                    menuCode: value
                })
                .subscribe(
                    (res) => {
                        this.lstArticleGroup = res['data']
                        this.listGroupCode.length = 0;
                        this.lstArticleGroup.forEach((obj: any) => {
                            this.listGroupCode.push(obj.groupCode);
                        })
                        this.doSearch();
                        this.groupCode = null;
                        this.loading = false;
                    },
                    () => {
                        this.loading = false;
                    }
                );
        } else {
            this.groupCode = null;
            this.lstArticleGroup = [];
            this.listGroupCode.length = 0;
            this.doSearch();
        }

    }
    //chọn sub con
    onChangeSubGroupCode() {
        this.listGroupCode.length = 0;
        this.listGroupCode.push(this.groupCode)
        this.doSearch();
    }
}

