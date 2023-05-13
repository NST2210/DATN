import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { EICON_TYPE } from 'src/app/common/enum/EType';
import { PORTAL_INFO_ENDPOINT, PORTAL_MAIL_ENDPOINT, } from 'src/app/common/enum/EApiUrl';
import { PortalMailDialogComponent } from './portal-mail-dialog/portal-mail-dialog.component';
import * as moment from 'moment';

@Component({
    selector: 'app-portal-mail',
    templateUrl: './portal-mail.component.html',
    styleUrls: ['./portal-mail.component.scss'],
})
export class PortalMailComponent implements OnInit {
    loading: boolean = false;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    dataList: any = [];
    portalCode: string = 'VDSS';
    lstPortal: any = [];

    statusId: number = -1;
    form!: FormGroup;


    lstStatus: any = [
        { value: -1, name: '---Tất cả---' },
        { value: 1, name: 'Đang hoạt động' },
        { value: 0, name: 'Không hoạt động' },
    ];

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã mail',
            options: {
                width: '15%',
                align: 'text-center',
            },
        },
        {
            name: 'subject',
            label: 'Tiêu đề',
            options: {},
        },
        {
            name: 'createdDate',
            label: 'Ngày tạo',
            options: {
                width: '15%',
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                },
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
                        obj['isActiveName'] = 'Đang bị khoá';
                    }
                    strHtml += '>' + obj['isActiveName'] + '</span>';
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
                this.openDialog(item);
            },
        },
        {
            iconType: EICON_TYPE.CORE_UI,
            customIcon: (obj: any) => {
                return obj['isActive'] === 0 ? 'cilCheckCircle' : 'cilBan';
            },
            customTooltip: (obj: any) => {
                return obj['isActive'] === 0
                    ? 'Đang hoạt động'
                    : 'Không hoạt động';
            },
            doAction: (item: any) => {
                this.changeActiveStatus(item);
            },
        },
    ];

    constructor(
        private dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.getAllPortal();
        this.buildForm();
        this.doSearch();
        if (this.portalCode) {
            this.onChangeSearch();
        }
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            code: ['', Validators.maxLength(30)],
        })
    }

    //lay danh sach portal
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

    openDialog(item?: any) {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để thêm mới');
            return;
        }
        let param: object = {
            title: 'Cập nhật thông tin',
            mailConfigId: item ? item['id'] : null,
            portalCode: this.portalCode,
        };

        const dialogRef = this.dialog.open(PortalMailDialogComponent, {
            width: '40%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    onChangeSearch() {
        this.doSearch();
    }

    doSearch(pageInfo?: any): any {
        if (!this.portalCode) {
            this.toast.showWarning('Thông báo', 'Chọn portal để tìm kiếm');
            return;
        }
        if (this.form.invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập lại dữ liệu tìm kiếm!');
            return;
        } else {
            this.loading = true;
            let params = {
                portalCode: this.portalCode,
                code: this.form.controls['code'].value,
                statusId: this.statusId,
                page: pageInfo ? pageInfo['page'] : this.page,
                size: pageInfo ? pageInfo['pageSize'] : this.pageSize,
            };
            this.api.post(PORTAL_MAIL_ENDPOINT.SEARCH, params).subscribe(
                (res) => {
                    this.dataList = res.data['list'];
                    this.totalItems = res.data['count'];
                    this.loading = false;
                },
                (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                }
            );
        }
    }


    changeActiveStatus(item: any) {
        this.loading = true;
        this.api.post(PORTAL_MAIL_ENDPOINT.CHANGE_ACTIVITIES, item['id']).subscribe((res) => {
            this.loading = false;
            if (res.data == true) {
                this.toast.showSuccess('Chuyển trạng thái thành công!');
                this.doSearch();
            } else {
                this.toast.showWarning("Chuyển trạng thái không thành công!")
            }
        }, (error) => {
            this.loading = false;
            this.toast.showError(error.message ? error.message : error);
        })
    }
}
