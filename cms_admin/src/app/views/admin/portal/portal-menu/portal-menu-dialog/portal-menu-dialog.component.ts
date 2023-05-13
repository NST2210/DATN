import { Component, Inject, OnInit } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogCommonComponent } from '../../../../../common/GUI/dialog-common/dialog-common.component';
import { PortalMenuLangModel } from '../../../../../common/model/PortalMenuLangModel';
import { ToastNotiService } from '../../../../../common/services/toastr/toast-noti.service';
import { PORTAL_MENU_LANG_ENDPOINT } from '../../../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../../../common/services/api/fetch-api.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-portal-menu-dialog',
    templateUrl: './portal-menu-dialog.component.html',
    styleUrls: ['./portal-menu-dialog.component.scss'],
})
export class PortalMenuDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    form!: FormGroup;
    lstPortalMenuLang: Array<PortalMenuLangModel> = [];
    lstLangByPortal: any = [];
    formType!: string;
    namePortal!: string;

    constructor(
        private dialogRef: MatDialogRef<PortalMenuDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private toast: ToastNotiService,
        private api: FetchApiService
    ) {}

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.formType = this.dataInput['type'];
        this.lstLangByPortal = this.dataInput['lstLangByPortal'];
        this.buildForm();
        this.updateForm(this.dataInput.item);
        if (this.formType === 'create') {
            this.getMaxDisplayOrder();
        }
        if (this.formType !== 'create') {
            this.getListPortalMenuLang();
        }
    }

    buildForm() {
        this.form = this.formBuilder.group({
            id: [null],
            portalCode: ['', [Validators.required]],
            menuCode: ['', [Validators.required, Validators.maxLength(30)]],
            displayOrder: ['', [Validators.required]],
            url: ['', [Validators.required]],
            displayDataHome: [null],
            displaySubmenu: [null],
            isActive: [null],
        });
    }

    updateForm(item?: any) {
        if (!this.form) this.buildForm();
        this.form.patchValue({
            id: item ? item['id'] : null,
            portalCode: item ? item['portalCode'] : this.dataInput.portalCode,
            menuCode: item ? item['menuCode'] : '',
            displayDataHome: !!(item && item['displayDataHome'] === 1),
            displaySubmenu: !!(item && item['displaySubmenu'] === 1),
            displayOrder: item ? item['displayOrder'] : '',
            url: item ? item['url'] : '',
            isActive: item ? item['isActive'] : null,
        });
        this.form.controls['portalCode'].disable();
        this.form.controls['displayOrder'].disable();
        this.namePortal = this.dataInput.namePortal;
        if (this.formType !== 'create') {
            this.form.controls['menuCode'].disable();
        }
        if (this.formType === 'detail') {
            this.form.controls['displayDataHome'].disable();
            this.form.controls['displaySubmenu'].disable();
        }
    }

    getValueOfField(item: any) {
        return this.form.get(item)?.value;
    }

    setValueToField(item: any, data: any) {
        return this.form.get(item)?.setValue(data);
    }

    doClose(): void {
        this.dialogRef.close();
    }

    onChangeLanguage() {}

    getListPortalMenuLang() {
        this.loading = true;
        let params = {
            portalCode: this.getValueOfField('portalCode'),
            menuCode: this.getValueOfField('menuCode'),
            displayDataHome: this.getValueOfField('displayDataHome'),
            displaySubmenu: this.getValueOfField('displaySubmenu'),
            isActive: this.getValueOfField('isActive'),
        };
        this.api
            .post(PORTAL_MENU_LANG_ENDPOINT.GET_LIST_PORTAL_MENU_LANG, params)
            .subscribe(
                (res) => {
                    this.lstPortalMenuLang = res.data;
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
    }

    doAddRow() {
        let rowItem = new PortalMenuLangModel();
        rowItem.isActive = 1;
        this.lstPortalMenuLang.unshift(rowItem);
    }

    doRemoveRow(item: any, index: number) {
        if (item['link']) {
            let param: Object = {
                title: 'Xác nhận xóa',
                message:
                    'Bạn có muốn xóa dữ liệu <strong>' +
                    item['title'] +
                    '&nbsp;(' +
                    item['link'] +
                    ')' +
                    '</strong>?',
            };
            const dialogRef = this.dialog.open(DialogCommonComponent, {
                width: '30%',
                data: param,
                disableClose: true,
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result && result['rs'] === true) {
                    this.lstPortalMenuLang.splice(index, 1);
                }
            });
        } else {
            this.lstPortalMenuLang.splice(index, 1);
        }
    }

    savePortalMenu() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }
        let lstNull = _.filter(this.lstPortalMenuLang, function (item) {
            return (
                typeof item.langCode == undefined ||
                item.langCode == 'undefined' ||
                !item.langCode ||
                !item.name
            );
        });
        if (lstNull.length !== 0) {
            this.toast.showWarning(
                'Cảnh báo',
                'Vui lòng chọn ngôn ngữ và nhập tên menu'
            );
            return;
        }

        let checkDuplicate = _.map(this.lstPortalMenuLang, 'langCode');
        let flagCheck = _.filter(checkDuplicate, (val, i, iteratee) =>
            _.includes(iteratee, val, i + 1)
        );
        if (flagCheck && flagCheck.length > 0) {
            this.toast.showWarning('Cảnh báo', 'Ngôn ngữ chọn đã bị trùng');
            return;
        }

        this.loading = true;
        let params: object = {
            id: this.getValueOfField('id'),
            portalCode: this.getValueOfField('portalCode'),
            menuCode: this.getValueOfField('menuCode').toUpperCase(),
            displayDataHome:
                this.getValueOfField('displayDataHome') === true ? 1 : 0,
            displaySubmenu:
                this.getValueOfField('displaySubmenu') === true ? 1 : 0,
            displayOrder: this.getValueOfField('displayOrder'),
            url: this.getValueOfField('url'),
            lstPortalMenuLang: this.lstPortalMenuLang,
        };
        this.api
            .post(PORTAL_MENU_LANG_ENDPOINT.SAVE_PORTAL_MENU, params)
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    if (res['data'] === 0) {
                        if (this.formType == 'update') {
                            this.toast.showSuccess(
                                'Thông báo',
                                'Cập nhật dữ liệu thành công!'
                            );
                        } else {
                            this.toast.showSuccess(
                                'Thông báo',
                                'Lưu thông tin thành công!'
                            );
                        }
                        this.doClose();
                    } else {
                        this.toast.showInfo(
                            'Thông báo',
                            'Mã menu đã tồn tại, kiểm tra lại thông tin đầu vào.'
                        );
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                },
            });
    }

    getMaxDisplayOrder() {
        this.loading = true;
        this.api
            .get(
                PORTAL_MENU_LANG_ENDPOINT.MAX_DISPLAY_ORDER +
                    this.dataInput.portalCode
            )
            .subscribe(
                (res) => {
                    this.loading = false;
                    if (res['data'] !== null) {
                        this.setValueToField('displayOrder', res['data'] + 1);
                    }
                },
                (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                }
            );
    }
}
