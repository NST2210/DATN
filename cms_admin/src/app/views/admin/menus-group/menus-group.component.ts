import {Component, OnInit} from '@angular/core';
import {MENU_GROUP_ENDPOINT} from 'src/app/common/enum/EApiUrl';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {MatDialog} from '@angular/material/dialog';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {EICON_TYPE} from "../../../common/enum/EType";
import {MenusGroupDialogComponent} from "./menus-group-dialog/menus-group-dialog.component";
import {EACTIVE} from "../../../common/enum/EStatus";
import {MenusGroupPermissionComponent} from "./menus-group-permission/menus-group-permission.component";

@Component({
    selector: 'app-menus-group',
    templateUrl: './menus-group.component.html',
    styleUrls: ['./menus-group.component.scss']
})
export class MenusGroupComponent implements OnInit {
    loading: boolean = false;
    dataList: any = [];
    isActive!: number;
    pageSize: number = 10;
    page: number = 0;
    totalItems: number = 0;
    form!: FormGroup;

    lstActiveStatus: any = [
        {name: '---Tất cả---', value: null},
        {name: 'Đang hoạt động', value: 1},
        {name: 'Không hoạt động', value: 0},
    ];

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã menu',
            options: {
                align: 'text-left',
            },
        },
        {
            name: 'name',
            label: 'Tên menu',
            options: {
                align: 'text-left',
            },
        },
        {
            name: 'icon',
            label: 'Biểu tượng',
            options: {
                align: 'text-center',
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
            icon: 'cilZoom',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xem chi tiết',
            doAction: (item: any) => {
                this.openDialog('detail', item);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Chỉnh sửa',
            doAction: (item: any) => {
                this.openDialog('update', item);
            },
        },
        {
            icon: 'cilUser',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Phân quyền menu',
            doAction: (item: any) => {
                this.openRolePermission(item);
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
                let activeCurrent = item['isActive'];
                let activeChange;

                if (activeCurrent === EACTIVE.ACTIVE) {
                    activeChange = EACTIVE.IN_ACTIVE;
                } else {
                    activeChange = EACTIVE.ACTIVE;
                }
                this.changeActiveStatus(item['id'], activeChange);
            },
        },
    ];

    constructor(
        private api: FetchApiService,
        public dialog: MatDialog,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.buildForm();
        this.doSearch();
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.maxLength(70)],
        })
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
                name: this.form.controls['name'].value,
                isActive: this.isActive,
                page: this.page,
                size: this.pageSize
            }
            this.api.post(MENU_GROUP_ENDPOINT.SEARCH_DATA, params).subscribe((res) => {
                this.dataList = res.data['list'];
                this.totalItems = res.data['count'];
                this.loading = false;
            }, () => {
                this.loading = false;
            })
        }
    }

    openDialog(type?: string, item?: any) {
        let titleType: string;
        if (type === 'update') {
            titleType = 'Cập nhật thông tin'
        } else if (type === 'detail') {
            titleType = 'Xem chi tiết bản ghi'
        } else {
            titleType = 'Thông tin thêm mới'
        }
        let param: object = {
            title: titleType,
            type: type,
            item: item ? item : null,
        };

        const dialogRef = this.dialog.open(MenusGroupDialogComponent, {
            width: '60%',
            data: param,
            disableClose:true,
        });
        dialogRef.afterClosed().subscribe(() => {
            this.doSearch();
        });
    }

    changeActiveStatus(id: number, activeStatus: number) {
        this.loading = true;
        this.api.post(MENU_GROUP_ENDPOINT.CHANGE_ACTIVE_STATUS, null, {
            id: id,
            activeStatus: activeStatus,
        }).subscribe((res) => {
                this.loading = false;
                if (res && res.data === true) {
                    let msg;
                    if (activeStatus === EACTIVE.DELETED) {
                        msg = 'Xoá dữ liệu thành công';
                    } else {
                        msg = 'Chuyển trạng thái thành công!';
                    }
                    this.toast.showSuccess('Thông báo', msg);
                    this.doSearch();
                }
            },
            () => {
                this.loading = false;
            }
        );
    }

    openRolePermission(item: any) {
        let params: object = {
            title: 'Phân quyền menu',
            item: item,
        };

        this.dialog.open(MenusGroupPermissionComponent, {
            width: '40%',
            data: params,
            disableClose:true
        }).afterClosed().subscribe(() => {
            this.doSearch();
        });
    }
}
