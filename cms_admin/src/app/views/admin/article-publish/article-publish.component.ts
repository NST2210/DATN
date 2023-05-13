import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ARTICLE_DETAIL_LANG, ARTICLE_GROUP, LANGUAGE_ENDPOINT, PORTAL_INFO_ENDPOINT } from 'src/app/common/enum/EApiUrl';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { ArticlePreviewPortalComponent } from '../../article-preview-portal/article-preview-portal.component';

@Component({
    selector: 'app-article-publish',
    templateUrl: './article-publish.component.html',
    styleUrls: ['./article-publish.component.scss']
})
export class ArticlePublishComponent implements OnInit {

    loading: boolean = false;

    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    type: number = 2; //dựa vào type để lấy ra những bản ghi có trạng thái đã duyệt

    dataList: any = [];
    listDataCheckbox: any = [];
    lstMenuCode: any = [];
    listGroupCode: any = [];
    menuCode!: string;
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
            options: {
                align: 'text-center',
            },
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
            name: 'approvedStatus',
            label: 'Trạng thái phê duyệt',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
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
                        strHtml += ' class="status-approved" ';
                        msg = 'Đã xuất bản';
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
            tooltip: 'Xem trước bài viết',
            doAction: (item: any) => {
                this.doPreview(item);
            },
        },
        {
            icon: 'cilShareBoxed',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xuất bản',
            doAction: (item: any) => {
                this.doPublishAticle(item);
            },
        },
    ];

    //tieu chi tim kiem
    lstPortal: any = [];
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];

    portalCode: string='VDSS';
    langCode: string='VI';
    groupCode!: any;

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        this.getAllPortal();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
            if (this.langCode) {
                this.onChangeLang(this.langCode)
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
            listGroupCode: this.listGroupCode,
            type: this.type,
            page: this.page,
            size: this.pageSize,
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
            this.api.get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, {
                portalCode: value,
            }).subscribe((res) => {
                this.lstLangByPortal = res['data'];
                // this.langCode = null;
                this.groupCode = null;
                this.lstArticleGroup = [];
                this.loading = false;
            }, () => {
                this.loading = false;
            });
        } else {
            // this.langCode = null;
            this.lstLangByPortal = [];
            this.groupCode = null;
            this.lstArticleGroup = [];
        }
        this.doSearch();
    }

    // onChangeLang(value: any) {
    //     if (value !== 'undefinded' && typeof value !== undefined) {
    //         this.loading = true;
    //         this.api
    //             .get(ARTICLE_GROUP.GET_BY_PORTAL, {
    //                 portalCode: this.portalCode,
    //                 langCode: value,
    //             })
    //             .subscribe(
    //                 (res) => {
    //                     this.lstArticleGroup = res['data'];
    //                     this.groupCode = '';
    //                     this.loading = false;
    //                     this.doSearch();
    //                 },
    //                 () => {
    //                     this.loading = false;
    //                 }
    //             );
    //     }
    // }

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

    doPublishAticleByCheckbox() {
        let itemCheck: any = _.filter(this.dataList, (obj: any) => {
            return obj['checked'] === true;
        });
        let ids = _.map(itemCheck, 'articleDetailLangId');
        if (ids && ids.length > 0) {
            let params: object = {
                title: 'Xác nhận',
                message: 'Bạn có chắc chắn muốn xuất bản <strong>' + ids.length + '</strong> bài viết đã chọn?',
                portalCode: this.portalCode,
                listIdDataCheckbox: ids,
            };

            const dialogRef = this.dialog.open(DialogCommonComponent, {
                width: '25%',
                data: params,
                disableClose: true
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result && result["rs"] === true) {
                    this.loading = true;
                    this.api.post(ARTICLE_DETAIL_LANG.PUBLISHBYCHECKBOX, ids).subscribe((res) => {
                        if (res.data == true) {
                            this.loading = false;
                            this.toast.showSuccess('Xuất bản ' + ids.length + ' bài viết thành công!');
                            this.doSearch();
                        } else {
                            this.loading = false;
                            this.toast.showWarning('Xuất bản ' + ids.length + ' bài viết không thành công!');
                        }
                    }, (error) => {
                        this.toast.showError(error.message ? error.message : error);
                    })
                }

            });
        } else {
            this.toast.showWarning('Vui lòng chọn bài viết cần xuất bản');
        }

    }

    doPublishAticle(item: any) {
        let params: Object = {
            title: 'Xác nhận',
            message:
                'Bạn có chắc chắn muốn xuất bản bài viết <strong>' + item['articleCode'] + '</strong>?'
        };
        this.dialog.open(DialogCommonComponent, {
            width: '25%',
            data: params,
            disableClose: true
        }).afterClosed().subscribe(result => {
            if (result && result["rs"] === true) {
                this.api.post(ARTICLE_DETAIL_LANG.PUBLISH, item).subscribe((res) => {
                    if (res.data == true) {
                        this.toast.showSuccess('Xuất bản bài viết thành công!');
                    }
                    this.doSearch();
                }, (error) => {
                    this.toast.showError(error.message ? error.message : error);
                })

            }
        });
    }

    doPreview(item: any) {
        let params: object = {
            title: 'Xem trước bài viết',
            langCode: item['langCode'],
            articleId: item['articleId'],
            portalCode: this.portalCode,
            item: item,
            isView: false,
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
    onChangeSubGroupCode() {
        this.listGroupCode.length = 0;
        this.listGroupCode.push(this.groupCode)
        this.doSearch();
    }
}
