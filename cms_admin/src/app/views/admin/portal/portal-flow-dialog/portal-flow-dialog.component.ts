import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MatDialog,
    MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import * as _ from 'lodash';
import { PORTAL_FLOW } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { PortalFlowUserModel } from '../../../../common/model/PortalFlowUserModel';
import { UsersSearchDialogComponent } from '../../users/users-search-dialog/users-search-dialog.component';

@Component({
    selector: 'app-portal-flow-dialog',
    templateUrl: './portal-flow-dialog.component.html',
    styleUrls: ['./portal-flow-dialog.component.scss'],
})
export class PortalFlowDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    lstRoles: any = [];
    portalCode!: string;
    formFlow!: FormGroup;
    lstFlowUser: Array<PortalFlowUserModel> = [];

    itemDetail: any;

    constructor(
        private dialogRef: MatDialogRef<PortalFlowDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.portalCode = this.dataInput['portalCode'];

        if (this.dataInput['item']) {
            this.itemDetail = this.dataInput['item'];
        }

        this.buildForm();
    }

    doAddRow() {
        let item = new PortalFlowUserModel();
        item.flowStep = this.lstFlowUser.length + 1;
        this.lstFlowUser.push(item);
    }

    buildForm() {
        this.formFlow = this.formBuilder.group({
            code: ['', [Validators.required, Validators.maxLength(30)]],
            name: ['', [Validators.required, Validators.maxLength(70)]],
        });

        if (this.itemDetail) {
            this.getFlowUser(this.itemDetail['code']);
            this.formFlow['controls']['code'].setValue(this.itemDetail['code']);
            this.formFlow['controls']['name'].setValue(this.itemDetail['name']);
            this.formFlow['controls']['code'].disable();
        }
    }

    getFlowUser(flowCode: string) {
        this.loading = true;
        this.api.get(PORTAL_FLOW.FLOW_USER, { flowCode: flowCode }).subscribe(
            (res) => {
                this.loading = false;
                this.lstFlowUser = res['data'];
            },
            () => {
                this.loading = false;
            }
        );
    }

    doSearchUser(item: any) {
        let param: object = {
            title: 'Thông tin người dùng',
            id: item ? item['id'] : null,
            userActive: item && item['userName'] ? item['userName'] : null,
            userChoice: _.map(this.lstFlowUser, 'userName'),
        };

        const dialogRef = this.dialog.open(UsersSearchDialogComponent, {
            width: '50%',
            data: param,
            disableClose:true
        });
        dialogRef.afterClosed().subscribe((data) => {
            if (data) {
                item['userDisplay'] =
                    data['userName'] +
                    '-' +
                    data['email'] +
                    '(' +
                    data['roleName'] +
                    ')';

                item['userName'] = data['userName'];
            }
        });
    }

    doSave() {
        if (this.formFlow.invalid) {
            this.formFlow.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }

        //check nguoi phe duyet
        let dataEmpty = _.filter(this.lstFlowUser, (obj) => {
            return !obj['userName'];
        });

        if (dataEmpty.length > 0 || this.lstFlowUser.length === 0) {
            this.toast.showWarning(
                'Thông báo',
                'Chưa chọn người duyệt trong luồng.'
            );
            return;
        }

        this.loading = true;
        let flowUsers = _.map(this.lstFlowUser, (obj) => {
            obj['flowCode'] =
                this.formFlow.controls['code'].value.toUpperCase();
            return obj;
        });

        let flowEntity = this.formFlow.getRawValue();
        flowEntity['portalCode'] = this.portalCode;
        flowEntity['id'] = this.itemDetail ? this.itemDetail['id'] : null;

        //update step order
        for (let i = 0; i < flowUsers.length; i++) {
            flowUsers[i]['flowStep'] = i;
        }
        let params: object = {
            flowEntity: flowEntity,
            lstFlowUser: flowUsers,
        };

        this.api.post(PORTAL_FLOW.CREATE, params).subscribe(
            (res) => {
                this.loading = false;
                if (res['data'] === 0) {
                    this.toast.showSuccess(
                        'Thông báo',
                        this.itemDetail && this.itemDetail['id']
                            ? 'Cập nhật luồng duyệt thành công'
                            : 'Thêm mới luồng duyệt thành công'
                    );
                    this.doClose();
                } else {
                    this.toast.showWarning(
                        'Thông báo',
                        'Mã luồng duyệt đã tồn tại. Kiểm tra lại thông tin đầu vào.'
                    );
                }
            },
            (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }

    doRemove(index: any) {
        this.lstFlowUser.splice(index, 1);

        //update flowStep
        for (let i = 0; i < this.lstFlowUser.length; i++) {
            this.lstFlowUser[i]['flowStep'] = i + 1;
        }
    }

    doSwitch(index: number, type: number) {
        if (type === 1) {
            //chuyen xuong
            this.lstFlowUser[index]['flowStep'] = index + 1;
            this.lstFlowUser[index + 1]['flowStep'] =
                this.lstFlowUser[index]['flowStep'] - 1;
        } else {
            //chuyen len
            this.lstFlowUser[index]['flowStep'] = index - 1;
            this.lstFlowUser[index - 1]['flowStep'] =
                this.lstFlowUser[index - 1]['flowStep'] + 1;
        }

        this.lstFlowUser = _.orderBy(this.lstFlowUser, ['flowStep'], ['asc']);
    }

    doClose(): any {
        this.dialogRef.close();
    }
}
