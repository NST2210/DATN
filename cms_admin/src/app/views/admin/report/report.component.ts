import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { ARTICLE_GROUP, LANGUAGE_ENDPOINT, PORTAL_INFO_ENDPOINT, REPORT_ENDPOINT } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';

@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

    loading: boolean = false;

    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    type: number = 2;

    portalCode: string = 'VDSS';
    langCode: any = 'VI';
    fromDate?: String;
    toDate?: String;
    createBy!: any;
    authorsName?: any;
    publishedFromDate?: String;
    publishedToDate?: String;
    publicationTime?: Date;
    articleSource!: any;
    approvedStatus: number = -1;

    lstApprovedStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Tạo nháp', value: 0 },
        { name: 'Chờ duyệt', value: 1 },
        { name: 'Đã duyệt', value: 2 },
        { name: 'Từ chối duyệt', value: 3 },
        { name: 'Xuất bản', value: 4 },
    ];

    dataList: any = [];
    lstLangByPortal: any = [];
    tableColumns: any = [
        {
            name: 'articleGroupName',
            label: 'Chuyên đề bài viết',
            options: {
                align: 'text-center',
                width: '7%'
            },
        },
        {
            name: 'articleCode',
            label: 'Mã bài viết',
            options: {
                align: 'text-center',
                width: '7%'
            },
        },
        {
            name: 'articleName',
            label: 'Tên bài viết',
            options: {
                align: 'text-left',
                width: '20%',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';
                    if (value && value.length >= 200) {
                        strHtml += ' class="resize-text" ';
                    } else {
                        strHtml += ' class="" ';
                    }
                    strHtml += '>' + (obj['articleName'] ? obj['articleName'] : '') + '</span>';
                    return strHtml;
                },
            },
        },
        {
            name: 'describe',
            label: 'Mô tả',
            options: {
                align: 'text-left',
                width: '18%',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';
                    if (value && value.length >= 200) {
                        strHtml += ' class="resize-text" ';
                    } else {
                        strHtml += ' class="" ';
                    }
                    strHtml += '>';
                    strHtml += (obj['describe'] ? obj['describe'] : '') + '</span>';
                    return strHtml;
                },
            },
        },
        {
            name: 'numberViewer',
            label: 'Số lượng người truy cập',
            options: {
                align: 'text-center',
                width: '8%',
                customBodyRender: (value: any) => {
                    return value ? value : 0;
                }
            },
        },
        {
            name: 'authorsName',
            label: 'Tác giả',
            options: {
                align: 'text-center',
                width: '8%',
            },
        },
        {
            name: 'articleSource',
            label: 'Nguồn bài viết',
            options: {
                align: 'text-center',
                width: '10%'
            },
        },
        {
            name: 'publicationTime',
            label: 'Thời gian xuất bản',
            options: {
                align: 'text-center',
                width: '10%',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
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
                width: '7%'
            },
        },
        {
            name: 'createBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
                width: '5%'
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
                    switch (value) {
                        case 0:
                            strHtml += ' class="status-draf" ';
                            msg = 'Tạo nháp';
                            break;
                        case 1:
                            strHtml += ' class="status-wait" ';
                            msg = 'Chờ duyệt';
                            break;
                        case 2:
                            strHtml += ' class="status-approved" ';
                            msg = 'Đã duyệt';
                            break;
                        case 3:
                            strHtml += ' class="status-error" ';
                            msg = 'Từ chối duyệt';
                            break;
                        case 4:
                            strHtml += ' class="status-success" ';
                            msg = 'Xuất bản';
                            break;
                    }
                    strHtml += '>' + msg + '</span>';
                    return strHtml;
                },
            },
        },

    ];

    //tieu chi tim kiem
    lstPortal: any = [];
    lstReportType: any = [];
    lstArticleGroup: any = [];


    reportType!: string;
    groupCode!: string;

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService,
    ) {
    }

    ngOnInit(): void {
        this.getAllPortal();
        // if(this.portalCode){
        //     this.onChangePortal(this.portalCode);{
        //         if(this.langCode){this.onChangeLang(this.langCode)}
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
            if (this.langCode) {
                this.onChangeLang(this.langCode)
            }
        }
    }

    doSearch(pageInfo?: any): any {
        debugger
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
            fromDate: this.fromDate,
            toDate: this.toDate,
            createBy: this.createBy,
            articleSource: this.articleSource,
            authorsName: this.authorsName,
            publishedFromDate: this.publishedFromDate,
            publishedToDate: this.publishedToDate,
            approvedStatus: this.approvedStatus,
            page: this.page,
            size: this.pageSize,
        };

        this.api.post(REPORT_ENDPOINT.GET_DATA_REPORT, param).subscribe(
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
            (error) => {
                this.loading = false;
            }
        );
    }

    onChangeLang(value: any) {
        if (value !== 'undefinded' && typeof value !== undefined) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.GET_BY_PORTAL, {
                    portalCode: this.portalCode,
                    langCode: value,
                })
                .subscribe({
                    next: (res) => {
                        this.lstArticleGroup = res['data'];
                        this.loading = false;
                        this.doSearch();
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        }
    }

    onChangeSearch() {
        this.doSearch();
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
                        // this.langCode = '';
                        this.groupCode = '';
                        this.loading = false;
                        this.doSearch();
                    },
                    () => {
                        this.loading = false;
                    }
                );
        }
    }

    doExport(): void {
        this.loading = true;

        let param = {
            portalCode: this.portalCode,
            langCode: this.langCode,
            fromDate: this.fromDate,
            toDate: this.toDate,
            createBy: this.createBy,
            articleSource: this.articleSource,
            authorsName: this.authorsName,
            publishedFromDate: this.publishedFromDate,
            publishedToDate: this.publishedToDate,
            approvedStatus: this.approvedStatus,
        }
        this.api.post(REPORT_ENDPOINT.EXPORT_EXCEL, param).subscribe(res => {
            this.loading = false;
            let data = res["data"];
            if (data && data["contentFile"]) {
                const blob = this.dataURItoBlob([data["contentFile"]]);
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = data["fileName"];
                link.click();
            } else {
                this.toast.showWarning('Thông báo', 'Không có dữ liệu báo cáo');
            }
        }, () => {
            this.toast.showError('Thông báo', 'Tải file pdf không thành công');
            this.loading = false;
        })

    }

    dataURItoBlob(dataURI: any) {
        const byteString = window.atob(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([int8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
}
