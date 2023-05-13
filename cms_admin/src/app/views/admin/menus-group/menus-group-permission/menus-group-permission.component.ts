import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UsersComponent} from "../../users/users.component";
import {FetchApiService} from "../../../../common/services/api/fetch-api.service";
import {ToastNotiService} from "../../../../common/services/toastr/toast-noti.service";
import {SelectionModel} from "@angular/cdk/collections";
import {MENU_GROUP_ENDPOINT} from "../../../../common/enum/EApiUrl";
import {MatTableDataSource} from "@angular/material/table";
import * as _ from "lodash";

@Component({
    selector: 'app-menus-group-permission',
    templateUrl: './menus-group-permission.component.html',
    styleUrls: ['./menus-group-permission.component.scss']
})
export class MenusGroupPermissionComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    displayedColumns: string[] = ['select', 'code', 'name'];
    selection = new SelectionModel<any>(true, []);
    dataSource: any;
    menuCode!: string;

    constructor(
        private dialogRef: MatDialogRef<UsersComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
    ) {
        this.menuCode = this.dataInput.item['code'];
    }

    ngOnInit(): void {
        this.getAllRoleActive();
    }

    getAllRoleActive() {
        this.loading = true;
        this.api.get(MENU_GROUP_ENDPOINT.ALL_ROLE_ACTIVE + this.menuCode).subscribe((res) => {
            this.dataSource = new MatTableDataSource<any>(res.data);
            _.forEach(this.dataSource.data, item => {
                if (item.isChoice !== 0) {
                    this.selection.select(item);
                }
            })
            this.loading = false;
        }, () => {
            this.loading = false;
        })
    }

    doClose(): any {
        this.dialogRef.close();
    }

    isAllSelected() {
        if (this.dataSource && this.selection) {
            const numSelected = this.selection.selected.length;
            const numRows = this.dataSource.filteredData.length === 0 ? this.dataSource.data.length : this.dataSource.filteredData.length;
            return numSelected === numRows;
        }
        return null
    }

    toggleAllRows() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        if (this.dataSource.filteredData.length === 0) {
            this.selection.select(...this.dataSource.data);
        } else {
            this.selection.clear();
            this.selection.select(...this.dataSource.filteredData);
        }
    }

    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    filterRole(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    doSave() {
        let lstRoleCode = _.map(this.selection.selected, 'code');
        if (!lstRoleCode || lstRoleCode.length <= 0) {
            this.toast.showWarning('Thông báo', 'Phải chọn ít nhất 1 quyền');
            return;
        }
        if (this.dataSource.filteredData.length === 0) {
            this.toast.showWarning('Thông báo', 'Không có dữ liệu');
            return;
        }
        this.loading = true;
        let params: object = {
            menuCode: this.menuCode,
            lstRoleCode: lstRoleCode
        }
        this.api.post(MENU_GROUP_ENDPOINT.SAVE_MENU_GROUP_ROLE, params).subscribe((res) => {
                this.loading = false;
                if (res.data === 0) {
                    this.toast.showSuccess('Thông báo', 'Lưu dữ liệu thành công');
                    this.doClose();
                } else {
                    this.toast.showError('Thông báo', 'Lưu dữ liệu thất bại');
                }
            }, (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        )
    }
}
