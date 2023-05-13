import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as moment from 'moment';
import {FetchApiService} from "../../../common/services/api/fetch-api.service";
import {ToastNotiService} from "../../../common/services/toastr/toast-noti.service";
import {MatDialog} from "@angular/material/dialog";
import {EICON_TYPE} from "../../../common/enum/EType";
import {RolesDialogComponent} from "./roles-dialog/roles-dialog.component";
import {DialogCommonComponent} from "../../../common/GUI/dialog-common/dialog-common.component";
import {ROLES_ENDPOINT} from "../../../common/enum/EApiUrl";

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
    loading: boolean = false;
    dataList: any = [];
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    form!: FormGroup;

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã quyền',
            options: {
                align: 'text-center'
            }
        },
        {
            name: 'name',
            label: 'Tên quyền',
            options: {
                align: 'text-left'
            }
        },
        {
            name: 'createdDate',
            label: 'Ngày tạo',
            options: {
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                }
            },
        },
        {
            name: 'createdBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
            },
        },
        {
            name: 'isActive',
            label: 'Tình trạng',
            options: {
                width: '10%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';
                    if (value === 1) {
                        strHtml += ' class="status-success" ';
                        obj["isActiveName"] = 'Đang hoạt động';
                    } else {
                        strHtml += ' class="status-error" ';
                        obj["isActiveName"] = 'Đang bị khoá';
                    }
                    strHtml += ">" + obj["isActiveName"] + "</span>";
                    return strHtml;
                }
            },
        },
    ];

    tableAction: any = [
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Sửa quyền',
            doAction: (item: any) => {
                this.openDialog('update', item);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Khoá quyền',
            customIcon: (obj: any) => {
                return obj["isActive"] === 0 ? 'cilLockUnlocked' : 'cilLockLocked'
            },
            customTooltip: (obj: any) => {
                return obj["isActive"] === 0 ? 'Mở khoá quyền' : 'Khoá quyền'
            },
            doAction: (item: any) => {
                this.doLockOrUnlockRole(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xoá quyền',
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
        this.doSearch();
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            roleName: ['', Validators.maxLength(70)],
            roleCode: ['', Validators.maxLength(30)],
        })
    }

    getValueOfField(item: any) {
        return this.form.get(item)?.value;
    }

    setValueToField(item: any, data: any) {
        return this.form.get(item)?.setValue(data);
    }

    doSearch(pageInfo?: any): any {
        if (this.form.invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập lại dữ liệu tìm kiếm!');
            return;
        } else {
            if (pageInfo) {
                this.page = pageInfo['page'];
                this.pageSize = pageInfo['pageSize'];
            }
            let params = {
                roleCode: this.getValueOfField('roleCode'),
                roleName: this.getValueOfField('roleName'),
                page: this.page,
                size: this.pageSize
            }
            this.loading = true
            this.api.post(ROLES_ENDPOINT.SEARCH_DATA, params).subscribe((res) => {
                this.dataList = res.data['list'];
                this.totalItems = res.data['count'];
                this.loading = false;
            }, () => {
                this.loading = false;
            })
        }

    }

    openDialog(type?: any, item?: any) {
        let params: object = {
            title: type === 'update' ? 'Cập nhật' : 'Thêm mới',
            data: item,
            formType: type,
        };

        this.dialog.open(RolesDialogComponent, {
            width: '40%',
            data: params,
            disableClose:true,
        }).afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    onDelete(item: any): any {
        let param: Object = {
            title: 'Xác nhận xóa',
            message:
                'Bạn có muốn xóa dữ liệu <strong>' +
                item['code'] +
                '</strong>?',
        };
        this.dialog.open(DialogCommonComponent, {
            width: '20%',
            data: param,
            disableClose:true
        }).afterClosed().subscribe((result) => {
            let params: Object = {
                id: item['id'],
                isActive: item['isActive'],
            }
            if (result && result['rs'] === true) {
                this.loading = true;
                this.api.post(ROLES_ENDPOINT.DELETE, params).subscribe((res) => {
                    this.loading = false;
                    if (res.data === true) {
                        this.toast.showSuccess('Thông báo', 'Xóa dữ liệu thành công!');
                        this.doSearch(0);
                    } else {
                        this.toast.showWarning('Thông báo', 'Xóa dữ liệu không thành công, quyền đang được sử dụng!');
                    }
                });
            }
        });
    }

    doLockOrUnlockRole(item: any) {
        let params: Object = {
            title: 'Xác nhận',
            message: item.isActive === 1 ?
                'Bạn có chắc chắn muốn khoá quyền <strong>' + item['code'] + '</strong>?' :
                'Bạn có chắc chắn muốn mở khoá quyền <strong>' + item['code'] + '</strong>?'
        };
        this.dialog.open(DialogCommonComponent, {
            width: '25%',
            data: params,
            disableClose:true
        }).afterClosed().subscribe(result => {
            let params: Object = {
                id: item['id'],
                isActive: item['isActive']
            }
            if (result && result["rs"] === true) {
                this.loading = true;
                this.api.post(ROLES_ENDPOINT.LOCK_OR_UNLOCK, params).subscribe((res) => {
                    this.loading = false;
                    if (res.data == true) {
                        if (item.isActive === 1) {
                            this.toast.showSuccess('Khoá quyền thành công!');
                        } else {
                            this.toast.showSuccess('Mở khoá quyền thành công!');
                        }
                        this.doSearch();
                    } else {
                        this.toast.showWarning('Không thể khóa quyền! Quyền đang được sử dụng');
                    }
                }, (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                })
            }
        });
    }
}
