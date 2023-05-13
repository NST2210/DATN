import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { ARTICLE_GROUP, IMG_VIDEOS, LANGUAGE_ENDPOINT, PORTAL_INFO_ENDPOINT } from 'src/app/common/enum/EApiUrl';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { ImagesDialogComponent } from './images-dialog/images-dialog.component';

@Component({
    selector: 'app-images',
    templateUrl: './images.component.html',
    styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit {
    loading: boolean = false;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    dataList: any = [];
    portalCode: string='VDSS';
    portalName!: string;
    langCode: string = 'VI';
    articleGroupCode!: any;
    lstPortal: any = [];
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];
    isDisabled = true;

    title!: string;


    tableColumns: any = [
        {
            name: 'content',
            label: 'Chuyên mục bài viết',
            options: {
                align: 'left',
            },
        },
        {
            name: 'langName',
            label: 'Ngôn ngữ',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'imgCount',
            label: 'Số lượng hình ảnh',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'videoCount',
            label: 'Số lượng video',
            options: {
                align: 'text-center',
            },
        }
    ];

    tableAction: any = [
        {
            icon: 'cilZoom',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xem chi tiết',
            doAction: (item: any) => {
                this.openDialog('detail', item, false);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Cập nhật',
            doAction: (item: any) => {
                this.openDialog('update', item, true);
            },
        },
    ];

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        this.getAllPortal();
    }

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe((res) => {
            this.lstPortal = res['data'];
            this.loading = false;
            this.onChangePortal(this.portalCode);
            if (this.langCode) {
                this.onChangeLang(this.langCode)
            }
        }, () => {
            this.loading = false;
        }
        );
    }

    onChangePortal(value: any) {
        // this.langCode = null;
        this.articleGroupCode = null;
        this.portalName = _.find(this.lstPortal, function (o) {
            return o['code'] === value;
        })['description'];
        if (value) {
            this.loading = true;
            this.api.get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, { portalCode: value, }).subscribe(
                (res) => {
                    this.lstLangByPortal = res['data'];
                    // this.langCode = null;
                    this.articleGroupCode = null;
                    this.lstArticleGroup = [];
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
        } else {
            // this.langCode = null;
            this.lstLangByPortal = [];
            this.articleGroupCode = null;
            this.lstArticleGroup = [];
        }
        // this.doSearch();
    }

    doSearch(pageInfo?: any) {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Vui lòng chọn portal để tìm kiếm');
            return;
        }
        this.loading = true;
        if (pageInfo) {
            this.page = pageInfo['page'];
            this.pageSize = pageInfo['pageSize'];
        }
        let param = {
            articleGroupCode: this.articleGroupCode,
            portalCode: this.portalCode,
            langCode: this.langCode,
            listGroupCode: [],
            page: this.page,
            size: this.pageSize,
        }
        this.api.post(IMG_VIDEOS.SEARCH_IMG_VIDEO_BY_ARTICLE, param).subscribe(
            (res) => {
                this.loading = false;
                this.dataList = res.data.list;
                this.dataList.forEach((obj: any) => {
                    this.lstLangByPortal.forEach((o: any) => {
                        if (o.langCode === obj.langCode) {
                            obj.langName = o.langName
                        }
                    })
                })
                this.totalItems = res.data.count;
            }, () => {
                this.loading = false;
            }
        );
    }
    onChangeLang(value: any) {
        if (value) {
            this.loading = true;
            this.api.get(ARTICLE_GROUP.GET_BY_PORTAL, {
                portalCode: this.portalCode,
                langCode: value,
            }).subscribe((res) => {
                this.lstArticleGroup = res['data'];
                this.loading = false;
            }, () => {
                this.loading = false;
            });
        } else {
            this.articleGroupCode = null;
            this.lstArticleGroup = [];
        }
        this.doSearch();
    }

    onChangeArticleGroup(value: any) {
        if (value) {
            this.doSearch();
        }
    }

    openDialog(type?: string, item?: any, isView?: boolean) {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Vui lòng chọn portal để thêm mới');
            return;
        }
        if (type === 'update') {
            this.title = 'Cập nhật thư viện hình ảnh, video';
        } else if (type === 'detail') {
            this.title = 'Xem chi tiết thư viện hình ảnh, video';
            isView = true;
        }
        let params: object = {
            portalCode: this.portalCode,
            item: item,
            formType: type,
            portalName: this.portalName,
            title: this.title,
        };
        this.isDisabled = false;
        const dialogRef = this.dialog.open(ImagesDialogComponent, {
            width: '50%',
            data: params,
            disableClose: true
        })
        dialogRef.afterClosed().subscribe((res) => {
            this.doSearch();
        });
    }
}
