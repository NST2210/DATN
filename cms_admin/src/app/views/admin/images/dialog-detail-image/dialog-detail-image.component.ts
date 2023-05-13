import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';
import {IMG_VIDEOS} from 'src/app/common/enum/EApiUrl';
import {EICON_TYPE} from 'src/app/common/enum/EType';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ImagesComponent} from '../images.component';
import {ToastNotiService} from "../../../../common/services/toastr/toast-noti.service";

@Component({
    selector: 'app-dialog-detail-image',
    templateUrl: './dialog-detail-image.component.html',
    styleUrls: ['./dialog-detail-image.component.scss']
})
export class DialogDetailImageComponent implements OnInit {
    loading: boolean = false;
    totalItems: number = 0;
    page: number = 0;
    pageSize: number = 10;
    portalCode!: string;
    isActive!: string;
    approveStatus!: string;
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
    dataList: any = [];
    tableColumns: any = [
        {
            name: 'pathStorage',
            label: 'Hình ảnh',
            options: {
                customBodyRender: (value: any, obj: any, index: number) => {
                    let strHtml =
                        '<img class="lang-icon" src="data:image/jpg;base64,';
                    strHtml += value;
                    strHtml += '"/>&nbsp;&nbsp;';
                    return strHtml;
                },
            },
        },
        {
            name: 'description',
            label: 'Mô tả',
            options: {},
        },
        {
            name: 'createDate',
            label: 'Ngày tạo',
            options: {
                width: '15%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any, index: number) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'createBy',
            label: 'Người tạo',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'updateDate',
            label: 'Ngày cập nhật',
            options: {
                width: '15%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
            },
        },
        {
            name: 'updateBy',
            label: 'Người cập nhật',
            options: {
                width: '10%',
                align: 'text-center',
            },
        },
        {
            name: 'isActive',
            label: 'Trạng thái',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';
                    if (value === 1) {
                        strHtml += ' class="status-success" ';
                        obj['isActiveName'] = 'Đang hoạt động';
                    } else {
                        strHtml += ' class="status-error" ';
                        obj['isActiveName'] = 'Không hoạt động';
                    }
                    strHtml += '>' + obj['isActiveName'] + '</span>';
                    return strHtml;
                },
            },
        }
    ];

    tableAction: any = [
        {
            icon: 'cilZoom',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xem chi tiết',
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Chỉnh sửa',
        },
    ];

    constructor(
        private api: FetchApiService,
        private dialogRef: MatDialogRef<ImagesComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        if (this.dataInput['portalCode']) {
            this.portalCode = this.dataInput['portalCode'];
            this.searchDataDetail();
        }
    }

    searchDataDetail() {
        this.loading = true;
        let param = {
            portalCode: this.portalCode,
            isActive: this.isActive,
            approvedStatus: this.approveStatus,
            page: this.page,
            size: this.pageSize
        }
        this.api.post(IMG_VIDEOS.SEARCH_IMG_VIDEOS, param).subscribe(
            (res) => {
                this.dataList = res.data.list;
                this.totalItems = res.data['count'];
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }

    doClose(): void {
        this.dialogRef.close();
    }
}
