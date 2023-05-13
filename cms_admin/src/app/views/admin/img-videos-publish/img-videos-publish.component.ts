import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import * as _ from 'lodash';
import * as moment from 'moment';
import {ARTICLE_GROUP, IMG_VIDEOS, LANGUAGE_ENDPOINT, PORTAL_INFO_ENDPOINT} from 'src/app/common/enum/EApiUrl';
import {EICON_TYPE} from 'src/app/common/enum/EType';
import {DialogCommonComponent} from 'src/app/common/GUI/dialog-common/dialog-common.component';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {ArticlePreviewPortalComponent} from '../../article-preview-portal/article-preview-portal.component';

@Component({
    selector: 'app-img-videos-publish',
    templateUrl: './img-videos-publish.component.html',
    styleUrls: ['./img-videos-publish.component.scss']
})
export class ImgVideosPublishComponent implements OnInit {

    loading: boolean = false;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    type: number = 2; //dựa vào type để lấy ra những bản ghi có trạng thái chưa xuất bản
    dataList: any = [];
    listDataCheckbox: any = [];
    listGroupCode: any = [];
    menuCode!: string;
    lstMenuCode: any = [];

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
            name: 'articleGroupName',
            label: 'Chuyên đề bài viết',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'pathStorage',
            label: 'Hình ảnh/Video',
            options: {
                customBodyRender: (value: any, obj: any) => {
                    let strHtml1 = '';
                    if (obj['fileType'] == 1) {
                        strHtml1 =
                            '<img class="image-display" src="data:image/jpg;base64,';
                        strHtml1 += obj['pathStorage'];
                        strHtml1 += '"/>&nbsp;&nbsp;';
                    } else {
                        strHtml1 = ' <video class="image-display"  #videoPlayer controls> <source src="data:video/mp4;base64,';
                        strHtml1 += obj['pathStorage'];
                        strHtml1 += '">';
                        strHtml1 += '</video>';
                    }
                    return strHtml1;
                },
            },
        },
        {
            name: 'description',
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
            name: 'approvedStatus',
            label: 'Trạng thái xuất bản',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let msg;
                    let strHtml = '<span';
                    if (value !== 4) {
                        strHtml += ' class="status-draf" ';
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
            icon: 'cilShareBoxed',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xuất bản',
            doAction: (item: any) => {
                this.doPublishImgVideos(item);
            },
        },
    ];

    //tieu chi tim kiem
    lstPortal: any = [];
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];

    portalCode: string = 'VDSS';
    langCode: string = 'VI';
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
            listGroupCode: this.listGroupCode,
            type: this.type,
            page: this.page,
            size: this.pageSize,
        };
        this.api.post(IMG_VIDEOS.SEARCH_FOR_PUBLISH, param).subscribe(
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
            }).subscribe(
                (res) => {
                    this.lstLangByPortal = res['data'];
                    // this.langCode = null;
                    this.groupCode = null;
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

    doPublishImgVideosByCheckbox() {
        let itemCheck: any = _.filter(this.dataList, (obj: any) => {
            return obj['checked'] === true;
        });
        let ids = _.map(itemCheck, 'id');
        if (ids && ids.length > 0) {
            let params: object = {
                title: 'Xác nhận',
                message: 'Bạn có chắc chắn muốn xuất bản <strong>' + ids.length + '</strong> Hình ảnh/Video đã chọn?',
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
                    this.api.post(IMG_VIDEOS.PUBLISH_IMG_VIDEOS_BYCHECKBOX, ids).subscribe((res) => {
                        if (res.data == true) {
                            this.loading = false;
                            this.toast.showSuccess('Xuất bản ' + ids.length + ' Hình ảnh/Video thành công!');
                            this.doSearch();
                        } else {
                            this.loading = false;
                            this.toast.showWarning('Xuất bản ' + ids.length + ' Hình ảnh/Video không thành công!');
                        }
                    }, (error) => {
                        this.toast.showError(error.message ? error.message : error);
                    })
                }

            });
        } else {
            this.toast.showWarning('Vui lòng chọn Hình ảnh/Video cần xuất bản');
        }

    }

    doPublishImgVideos(item: any) {
        let params: Object = {
            title: 'Xác nhận',
            message:
                'Bạn có chắc chắn muốn xuất bản Hình ảnh/Video đã chọn?'
        };
        this.dialog.open(DialogCommonComponent, {
            width: '25%',
            data: params,
            disableClose: true
        }).afterClosed().subscribe(result => {
            if (result && result["rs"] === true) {
                this.api.post(IMG_VIDEOS.PUBLISH__IMG_VIDEOS, item['id']).subscribe((res) => {
                    this.loading = false;
                    if (res.data == true) {
                        this.toast.showSuccess('Xuất bản thành công!');
                    }
                    this.loading = false;
                    this.doSearch();
                }, (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                })

            }
        });
    }

    doPreview(item: any) {
        let params: object = {
            title: 'Xem trước Hình ảnh/Video',
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
