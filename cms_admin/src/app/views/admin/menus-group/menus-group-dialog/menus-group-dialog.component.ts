import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import * as _ from "lodash";
import {MENU_GROUP_ENDPOINT} from "../../../../common/enum/EApiUrl";
import {FetchApiService} from "../../../../common/services/api/fetch-api.service";
import {ToastNotiService} from "../../../../common/services/toastr/toast-noti.service";
import {CoreUIIconsComponent} from "../../../icons/coreui-icons.component";
import { REGEX_PATERN } from 'src/app/common/enum/ERegexPatern';

@Component({
    selector: 'app-menus-group-dialog',
    templateUrl: './menus-group-dialog.component.html',
    styleUrls: ['./menus-group-dialog.component.scss']
})
export class MenusGroupDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    formType!: string;
    form!: FormGroup;
    listMenuParent: any = [];
    oldParentId!: any;
    oldDisplayOrder!: any;
    checkSubMenu: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<MenusGroupDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private toast: ToastNotiService,
        private api: FetchApiService,
    ) {
    }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.formType = this.dataInput['type'];
        this.buildForm();
        this.updateForm(this.dataInput.item);
        this.getMenuParent();
        if (this.formType === 'create') {
            this.getMaxDisplayOrder();
        }
    }

    buildForm() {
        this.form = this.formBuilder.group({
            id: [null],
            code: ['', [Validators.required, Validators.pattern(REGEX_PATERN.CODE), Validators.maxLength(30)]],
            name: ['', [Validators.required, Validators.maxLength(70)]],
            path: ['', [Validators.required, Validators.maxLength(255)]],
            icon: [''],
            parentId: [-1],
            menuLevel: [null],
            displayOrder: ['', [Validators.required]],
            isActive: [null]
        })
    }

    updateForm(item?: any) {
        if (!this.form) this.buildForm();
        this.form.patchValue({
            id: item && item['id'] ? item['id'] : null,
            code: item && item['code'] ? item['code'] : '',
            name: item && item['name'] ? item['name'] : '',
            path: item && item['path'] ? item['path'] : '',
            icon: item && item['icon'] ? item['icon'] : '',
            parentId: item && item['parentId'] ? item['parentId'] : -1,
            menuLevel: item && item['menuLevel'] ? item['menuLevel'] : null,
            displayOrder: item && item['displayOrder'] ? item['displayOrder'] : '',
        })
        this.form.controls['displayOrder'].disable();
        if (this.formType === 'detail') {
            this.form.disable();
        }
        if (this.formType === 'update') {
            this.form.controls['code'].disable();
            this.haveSubMenu();
        }
        this.oldParentId = this.getValueOfField('parentId');
        this.oldDisplayOrder = this.getValueOfField('displayOrder');
    }

    getValueOfField(item: any) {
        return this.form.get(item)?.value;
    }

    setValueToField(item: any, data: any) {
        return this.form.get(item)?.setValue(data);
    }

    getMenuParent() {
        this.loading = true;
        this.api.get(MENU_GROUP_ENDPOINT.MENU_PARENT).subscribe((res) => {
                this.listMenuParent = res['data'];
                //Không lấy chính menu đó nếu nó là menu cha và là cập nhật
                if (this.formType !== 'create' && this.getValueOfField('parentId') === -1) {
                    this.listMenuParent = _.filter(this.listMenuParent, (item) => {
                        if (this.getValueOfField('code') !== item.code)
                            return item;
                    })
                }
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }

    doChoiceIcon() {
        let param: object = {
            title: 'Icon hệ thống',
            iconCurrent: this.getValueOfField('icon')
        };

        const dialogRef = this.dialog.open(CoreUIIconsComponent, {width: "80%", data: param,});
        dialogRef.afterClosed().subscribe((rs) => {
            if (rs) {
                this.setValueToField('icon', rs);
            }
        });
    }

    saveMenuGroup() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.showWarning('Cảnh báo', 'Kiểm tra lại thông tin đầu vào');
            return;
        }
        this.loading = true;
        let params: object = {
            id: this.getValueOfField('id'),
            code: this.getValueOfField('code').toUpperCase(),
            name: this.getValueOfField('name'),
            path: this.getValueOfField('path'),
            icon: this.getValueOfField('icon'),
            parentId: this.getValueOfField('parentId'),
            menuLevel: this.getValueOfField('menuLevel'),
            displayOrder: _.toNumber(this.getValueOfField('displayOrder')),
        };
        this.api.post(MENU_GROUP_ENDPOINT.SAVE_MENU_GROUP, params).subscribe(
            (res) => {
                this.loading = false;
                if (res['data'] === 0) {
                    if (this.formType == 'update') {
                        this.toast.showSuccess('Thông báo', 'Cập nhật dữ liệu thành công!');
                    } else {
                        this.toast.showSuccess('Thông báo', 'Lưu thông tin thành công!');
                    }
                    this.doClose();
                } else {
                    this.toast.showInfo('Thông báo', 'Mã menu đã tồn tại, kiểm tra lại thông tin đầu vào.');
                }
            }, (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }

    doClose() {
        this.dialogRef.close();
    }

    getMaxDisplayOrder(value?: any) {
        this.loading = true
        this.api.get(MENU_GROUP_ENDPOINT.MAX_DISPLAY_ORDER + (value ? value : this.getValueOfField('parentId'))).subscribe(
            (res) => {
                this.loading = false;
                if (res['data'] !== null) {
                    this.setValueToField('displayOrder', res['data'] + 1);
                }
            }, (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }

    onChangeMenuParent(item: any) {
        if (this.formType === 'create') {
            this.getMaxDisplayOrder();
        } else if (this.formType === 'update' && this.oldParentId !== this.getValueOfField('parentId')) {
            this.getMaxDisplayOrder(item.value);
        } else {
            this.setValueToField('displayOrder', this.oldDisplayOrder);
        }
    }

    haveSubMenu() {
        this.loading = true
        this.api.get(MENU_GROUP_ENDPOINT.HAVE_SUB_MENU + this.getValueOfField('id')).subscribe(
            (res) => {
                this.loading = false;
                if (res && res['data'] === 1) {
                    this.form.controls['parentId'].disable();
                }
            }, (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }
}
