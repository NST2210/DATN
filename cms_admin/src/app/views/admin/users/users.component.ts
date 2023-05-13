import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import * as _ from 'lodash';
import * as moment from 'moment';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { USERS_ENDPOINT } from "../../../common/enum/EApiUrl";
import { ESTATUS } from "../../../common/enum/EStatus";
import { EICON_TYPE } from "../../../common/enum/EType";
import { DialogCommonComponent } from "../../../common/GUI/dialog-common/dialog-common.component";
import { DialogDeleteComponent } from "../../../common/GUI/dialog-delete/dialog-delete.component";
import { UserDialogComponent } from "./user-dialog/user-dialog.component";

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
    loading: boolean = false;
    dataList: any = [];
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    form!: FormGroup;
    lstStatus: any = [
        { code: null, value: '-----Chọn-----' },
        { code: ESTATUS.UNLOCK, value: 'Đang hoạt động' },
        { code: ESTATUS.LOCK, value: 'Đang bị khoá' },
    ];
    tableColumns: any = [
        {
            name: 'userName',
            label: 'Tên đăng nhập',
            options: {
                align: 'text-center',
            }
        },
        {
            name: 'email',
            label: 'Email',
            options: {
                align: 'text-center',
            }
        },
        {
            name: 'createBy',
            label: 'Người tạo',
            options: {
                align: 'text-center',
            }
        },
        {
            name: 'createDate',
            label: 'Ngày tạo',
            options: {
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                }
            }
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
                        obj["isActiveName"] = 'Đang hoạt động';
                    } else {
                        strHtml += ' class="status-error" ';
                        obj["isActiveName"] = 'Đang bị khoá';
                    }
                    strHtml += ">" + obj["isActiveName"] + "</span>";
                    return strHtml;
                }
            },
        }
    ];
    tableAction: any = [
        {
            icon: 'cilZoom',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xem chi tiết',
            doAction: (item: any) => {
                let _clone = _.cloneDeep(item);
                this.openDialog('detail', _clone);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Sửa người dùng',
            doAction: (item: any) => {
                this.openDialog('update', item);
            },
        },
        {
            iconType: EICON_TYPE.CORE_UI,
            customIcon: (obj: any) => {
                return obj["isActive"] === 0 ? 'cilLockUnlocked' : 'cilLockLocked'
            },
            customTooltip: (obj: any) => {

                return obj["isActive"] === 0 ? 'Mở khoá' : 'Khoá'
            },
            doAction: (item: any) => {
                let _clone = _.cloneDeep(item);
                if (item["userName"] !== "admin") {
                    this.doLockOrUnlockUser(_clone);
                } else {
                    this.toast.showWarning('Thông báo', 'Tài khoản admin không được phép khóa!');
                }

            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xóa',
            doAction: (item: any) => {
                let _clone = _.cloneDeep(item);
                if (item["userName"] !== "admin") {
                    this.doDeleteUser(_clone);
                } else {
                    this.toast.showWarning('Thông báo', 'Tài khoản admin không được phép xóa!');
                }
            },
        },
        {
            icon: 'cilSync',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Reset mật khẩu',
            doAction: (item: any) => {
                this.doResetPass(item);
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
            userName: ['', Validators.maxLength(70)],
            email: ['', Validators.maxLength(40)],
            status: [''],
        })
    }

    getValueOfField(item: any) {
        return this.form.get(item)?.value;
    }

    setValueToField(item: any, data: any) {
        return this.form.get(item)?.setValue(data);
    }

    doSearch(pageInfo?: any) {
        if (this.form.invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập lại dữ liệu tìm kiếm!');
            return;
        } else {
            this.loading = true;
            if (pageInfo) {
                this.page = pageInfo['page'];
                this.pageSize = pageInfo['pageSize'];
            }
            let params = {
                userName: this.getValueOfField('userName'),
                email: this.getValueOfField('email'),
                status: this.getValueOfField('status'),
                page: this.page,
                size: this.pageSize
            }
            this.api.post(USERS_ENDPOINT.GET_USER, params).subscribe((res) => {
                this.dataList = res.data['list'];
                this.totalItems = res.data['count'];
                this.loading = false;
            }, () => {
                this.loading = false;
            })
        }

    }

    openDialog(type: any, item: any) {
        let params: object = {
            title: type === 'detail' ? 'Xem chi tiết' : 'Cập nhật',
            data: item,
            formType: type,
        };

        this.dialog.open(UserDialogComponent, {
            width: '60%',
            data: params,
            disableClose: true
        }).afterClosed().subscribe(() => {
            if (type !== 'detail')
                this.doSearch();
        });
    }

    doLockOrUnlockUser(item: any) {
        let params: Object = {
            title: 'Xác nhận',
            message: item.isActive === 1 ?
                'Bạn có chắc chắn muốn khoá người dùng <strong>' + item['userName'] + '</strong>?' :
                'Bạn có chắc chắn muốn mở khoá người dùng <strong>' + item['userName'] + '</strong>?'
        };
        this.dialog.open(DialogCommonComponent, {
            width: '25%',
            data: params,
            disableClose: true
        }).afterClosed().subscribe(result => {
            if (result && result["rs"] === true) {
                this.loading = true;
                this.api.post(USERS_ENDPOINT.LOCK_UNLOCK_USER, item['userId']
                ).subscribe((res) => {
                    this.loading = false;
                    if (res.data == true) {
                        if (item.isActive === 1) {
                            this.toast.showSuccess('Khoá người dùng thành công!');
                        } else {
                            this.toast.showSuccess('Mở khoá người dùng thành công!');
                        }
                        this.doSearch();
                    }
                }, (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                })
            }
        });
    }

    doAddUser(): any {
        let params: object = {
            title: 'Thêm mới',
            formType: 'create'
        };
        this.dialog.open(UserDialogComponent, {
            width: '60%',
            data: params,
            disableClose:true,
        }).afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    // Xóa người dùng
    doDeleteUser(item: any) {
        let params: Object = {
            title: 'Xác nhận',
            message: 'Bạn có chắc chắn muốn xóa người dùng <strong>' + item['userName'] + '</strong> không?'
        };
        this.dialog.open(DialogDeleteComponent, {
            width: '25%',
            data: params,
            disableClose: true
        }).afterClosed().subscribe(result => {
            if (result && result["rs"] === true) {
                this.loading = true;
                this.api.post(USERS_ENDPOINT.DELETE_USER, item['userId']).subscribe((res) => {
                    this.loading = false;
                    if (res.data == true) {
                        this.toast.showSuccess('Xóa người dùng ' + item['userName'] + ' thành công!');
                        this.doSearch();
                    } else {
                        this.toast.showError('Người dùng ' + item['userName'] + ' không tồn tại');
                    }
                    this.loading = false;
                }, (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                })
            }
        });
    }

    // Reset mật khẩu
    doResetPass(item: any) {
        let params: Object = {
            title: 'Xác nhận',
            message: 'Bạn có muốn reset mật khẩu của người dùng <strong>' + item['userName'] + '</strong> không?'
        };
        this.dialog.open(DialogCommonComponent, {
            width: '25%',
            data: params,
            disableClose: true
        }).afterClosed().subscribe(result => {
            if (result && result["rs"] === true) {
                this.api.post(USERS_ENDPOINT.RESET_PASS, item).subscribe((res) => {
                    if (res.data == true) {
                        this.toast.showSuccess('Reset mật khẩu của người dùng ' + item['userName'] + ' thành công!');
                        this.doSearch();
                    } else {
                        this.toast.showError('Người dùng ' + item['userName'] + ' không tồn tại');
                    }
                }, (error) => {
                    this.toast.showError(error.message ? error.message : error);
                })
            }
        });
    }
    updateValidate(a: any) {
        if (a === true) {
            this.form.controls['status'].setValidators(Validators.required);
            this.form.controls['status'].updateValueAndValidity();
        }
    }
}
