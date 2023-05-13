import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {
    ARTICLE_GROUP,
    LANGUAGE_ENDPOINT,
    PORTAL_INFO_ENDPOINT,
    FEEDBACK,
} from 'src/app/common/enum/EApiUrl';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-contact-and-feedback',
    templateUrl: './contact-and-feedback.component.html',
    styleUrls: ['./contact-and-feedback.component.scss'],
})
export class ContactAndFeedbackComponent implements OnInit {
    loading: boolean = false;

    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    type: number = 2;
    status: number = -1;

    portalCode: string = 'VDSS';
    langCode: String = 'VI';
    fromDate?: String;
    toDate?: String;
    publicationTime?: Date;
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
            name: 'name',
            label: 'Tên',
            options: {
                align: 'text-left',
                width: '7%',
            },
        },
        {
            name: 'title',
            label: 'Vị trí ứng tuyển',
            options: {
                align: 'text-left',
                width: '7%',
            },
        },
        {
            name: 'email',
            label: 'Email',
            options: {
                align: 'text-center',
                width: '7%',
            },
        },
        {
            name: 'mobilePhone',
            label: 'Số điện thoại',
            options: {
                align: 'text-center',
                width: '5%',
            },
        },
        {
            name: 'content',
            label: 'Nội dung',
            options: {
                align: 'text-center',
                width: '20%',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';
                    if (value && value.length >= 200) {
                        strHtml += ' class="resize-text" ';
                    } else {
                        strHtml += ' class="" ';
                    }
                    strHtml +=
                        '>' +
                        (obj['content'] ? obj['content'] : '') +
                        '</span>';
                    return strHtml;
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
                width: '7%',
            },
        },
        {
            name: 'isType',
            label: 'Loại Liên hệ/Ứng tuyển',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';
                    if (obj.title == null) {
                        strHtml += ' class="status-success" ';
                        obj['isType'] = 'Liên hệ';
                    } else {
                        strHtml += ' class="status-draf" ';
                        obj['isType'] = 'Ứng tuyển';
                    }
                    strHtml += '>' + obj['isType'] + '</span>';
                    return strHtml;
                },
            },
        },
    ];

    tableAction: any = [
        {
            icon: 'cilCloudDownload',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Tải file',
            doAction: (item: any) => {
                this.doDownload(item);
            },
            display: (obj: any) => {
                return !!obj['fileBase64'];
            },
        },
    ];

    //tieu chi tim kiem
    lstPortal: any = [];
    lstReportType: any = [];
    lstArticleGroup: any = [];
    lstStatus: any = [
        { name: '---Tất cả---', value: -1 },
        { name: 'Liên hệ', value: 1 },
        { name: 'Ứng tuyển', value: 0 },
    ];

    reportType!: string;
    groupCode!: string;

    constructor(
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {}

    ngOnInit(): void {
        this.getAllPortal();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
            if (this.langCode) {
                this.onChangeLang(this.langCode);
            }
        }
    }

    doDownload(item: any) {
        this.api.get(`files/${item.fileName}`, undefined, 'blob').subscribe({
            next: (data) => {
                if (data) {
                    saveAs(data, item.fileName);
                }
            },
            error: (err) => console.log(new Error(err)),
        });
    }

    downloadBase64File(contentBase64: string, name: string) {
        const [extension] = contentBase64.split(',');
        let fileName = '';
        if (extension.includes('application/pdf')) {
            fileName = `${name}.pdf`;
        } else if (
            extension.includes(
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
        ) {
            fileName = `${name}.docx`;
        } else if (extension.includes('application/msword')) {
            fileName = `${name}.doc`;
        }
        const linkSource = contentBase64;
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);
        downloadLink.href = linkSource;
        downloadLink.target = '_self';
        downloadLink.download = fileName;
        downloadLink.click();
    }

    checkDisplayAction(item: any) {
        return !!item.fileBase64;
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
            fromDate: this.fromDate,
            toDate: this.toDate,
            approvedStatus: this.approvedStatus,
            page: this.page,
            size: this.pageSize,
            status: this.status,
        };

        this.api.post(FEEDBACK.GET_DATA_FEEDBACK, param).subscribe({
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
            },
            error: (error) => {
                this.loading = false;
            },
        });
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
                .subscribe({
                    next: (res) => {
                        this.lstLangByPortal = res['data'];
                        // this.langCode = '';
                        this.groupCode = '';
                        this.loading = false;
                        this.doSearch();
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        }
    }

    dataURItoBlob(dataURI: any) {
        const byteString = window.atob(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([int8Array], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
    }

    doExport(): void {
        this.loading = true;

        let param = {
            portalCode: this.portalCode,
            langCode: this.langCode,
            fromDate: this.fromDate,
            toDate: this.toDate,
            approvedStatus: this.approvedStatus,
        };
        this.api.post(FEEDBACK.EXPORT_EXCEL, param).subscribe(
            (res) => {
                this.loading = false;
                let data = res['data'];
                if (data && data['contentFile']) {
                    const blob = this.dataURItoBlob([data['contentFile']]);
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = data['fileName'];
                    link.click();
                } else {
                    this.toast.showWarning(
                        'Thông báo',
                        'Không có dữ liệu báo cáo'
                    );
                }
            },
            () => {
                this.toast.showError(
                    'Thông báo',
                    'Tải file pdf không thành công'
                );
                this.loading = false;
            }
        );
    }
}
