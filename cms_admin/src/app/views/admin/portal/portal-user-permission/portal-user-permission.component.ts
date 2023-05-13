import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UsersComponent} from "../../users/users.component";
import {FetchApiService} from "../../../../common/services/api/fetch-api.service";
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {ToastNotiService} from "../../../../common/services/toastr/toast-noti.service";
import {PORTAL_USER_ENPOINT} from "../../../../common/enum/EApiUrl";
import * as _ from 'lodash';

@Component({
    selector: 'app-portal-user-permission',
    templateUrl: './portal-user-permission.component.html',
    styleUrls: ['./portal-user-permission.component.scss']
})
export class PortalUserPermissionComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    userName!: string;
    totalItems: number = 0;
    displayedColumns: string[] = ['select', 'userName', 'mailTo'];
    selection = new SelectionModel<any>(true, []);
    dataSource: any;
    portalCode!: string;

    constructor(
        private dialogRef: MatDialogRef<UsersComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
    ) {
        this.portalCode = this.dataInput.item['code'];
    }

    ngOnInit() {
        this.title = this.dataInput["title"];
        this.getAllUserActive();
    }

    doClose(): any {
        this.dialogRef.close();
    }

    getAllUserActive() {
        this.loading = true;
        this.api.get(PORTAL_USER_ENPOINT.ALL_USER_ACTIVE + this.portalCode).subscribe((res) => {
            this.dataSource = new MatTableDataSource<any>(res.data);
            _.forEach(this.dataSource.data, item => {
                if (item.isChoice !== 0) {
                    this.selection.select(item);
                }
            })
            this.totalItems = res.data.length;
            this.loading = false;
        }, () => {
            this.loading = false;
        })
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

    filterUser(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    doSave() {
        let lstUserName = _.map(this.selection.selected, 'userName');
        if (!lstUserName || lstUserName.length <= 0) {
            this.toast.showWarning('Thông báo', 'Phải chọn ít nhất 1 người dùng');
            return;
        }
        if (this.dataSource.filteredData.length === 0) {
            this.toast.showWarning('Thông báo', 'Không có dữ liệu');
            return;
        }
        this.loading = true;
        let params: object = {
            portalCode: this.portalCode,
            lstUserName: lstUserName
        }
        this.api.post(PORTAL_USER_ENPOINT.SAVE_PORTAL_USER, params).subscribe((res) => {
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
