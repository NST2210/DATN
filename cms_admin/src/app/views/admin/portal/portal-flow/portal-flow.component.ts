import { Component, OnInit } from '@angular/core';
import { MatDialog, } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import * as moment from 'moment';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { PORTAL_FLOW, PORTAL_INFO_ENDPOINT } from 'src/app/common/enum/EApiUrl';
import { PortalFlowDialogComponent } from '../portal-flow-dialog/portal-flow-dialog.component';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';

@Component({
    selector: 'app-portal-flow',
    templateUrl: './portal-flow.component.html',
    styleUrls: ['./portal-flow.component.scss'],
})
export class PortalFlowComponent implements OnInit {
    loading: boolean = false;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    dataList: any = [];
    lstPortal: any = [];
    portalCode: string = 'VDSS';
    form!: FormGroup;

    lstStatus: any = [
        { value: -1, name: '---Tất cả---' },
        { value: 0, name: 'Không hoạt động' },
        { value: 1, name: 'Đang hoạt động' },
    ];

    statusId!: number;

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã luồng duyệt',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'name',
            label: 'Tên luồng duyệt',
        },
        {
            name: 'createdBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'createdDate',
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
    ];

    tableAction: any = [
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Chỉnh sửa',
            doAction: (item: any) => {
                this.doDialog(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xoá luồng duyệt',
            doAction: (item: any) => {
                this.onDelete(item);
            },
        },
    ];

    constructor(
        private api: FetchApiService,
        private toast: ToastNotiService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.buildForm();
        this.getAllPortal();
        if(this.portalCode){
            this.onChangePortal(this.portalCode);
        }
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            maTenLuong: ['', Validators.maxLength(70)],
        })
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

    doSearch(pageInfo?: any): any {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để tìm kiếm');
            return;
        }
        if (pageInfo) {
            this.page = pageInfo['page'];
            this.pageSize = pageInfo['pageSize'];
        }
        if (this.form.invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập lại dữ liệu tìm kiếm!');
            return;
        } else {
            this.loading = true;
            let paramBody = {
                portalCode: this.portalCode,
                maTenLuong: this.form.controls['maTenLuong'].value,
                statusId: this.statusId,
                page: this.page,
                size: this.pageSize
            };

            this.api.post(PORTAL_FLOW.SEARCH, paramBody).subscribe(
                (res) => {
                    this.loading = false;
                    this.dataList = res.data['list'];
                    this.totalItems = res.data['count'];
                },
                () => {
                    this.loading = false;
                }
            );
        }
    }

    doDialog(item: any) {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để thêm mới');
            return;
        }

        let param: object = {
            title: item ? 'Cập nhật thông tin' : 'Thông tin thêm mới',
            item: item ? item : null,
            portalCode: this.portalCode,
        };

        const dialogRef = this.dialog.open(PortalFlowDialogComponent, {
            width: '60%',
            data: param,
            disableClose:true
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    onChangePortal(value: any) {
        if (value) {
            this.doSearch();
        }
    }

    onDelete(item: any): any {
        let params: Object = {
            title: 'Xác nhận',
            message: 'Bạn có chắc chắn muốn xóa: <strong>' + item['code'] + '</strong>?',
        };
        this.dialog.open(DialogCommonComponent, {
            width: '25%',
            data: params,
            disableClose: true
        }).afterClosed().subscribe((result) => {
            let params: Object = {
                id: item['id'],
                isActive: item['isActive'],
            }
            if (result && result['rs'] === true) {
                this.loading = true;
                this.api.post(PORTAL_FLOW.DELETE, params).subscribe(
                    (res) => {
                        this.loading = false;
                        if (res.data === true) {
                            this.toast.showSuccess('Thông báo', 'Xóa luồng duyệt thành công!');
                            this.doSearch();
                        } else {
                            this.toast.showWarning('Thông báo', 'Xóa dữ liệu không thành công, luồng duyệt đang được sử dụng!');
                        }
                    }, (error) => {
                        this.loading = false;
                        this.toast.showError(
                            error.message ? error.message : error
                        );
                    }
                );
            }
        });
    }
}
