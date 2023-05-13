import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import {PORTAL_MAIL_ENDPOINT} from 'src/app/common/enum/EApiUrl';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';

@Component({
    selector: 'app-portal-mail-dialog',
    templateUrl: './portal-mail-dialog.component.html',
    styleUrls: ['./portal-mail-dialog.component.scss'],
})
export class PortalMailDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    Editor = DecoupledEditor;
    portalCode!: string;
    mailConfigForm!: FormGroup;
    mailConfigId!: number;

    constructor(
        private dialogRef: MatDialogRef<PortalMailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.mailConfigId = this.dataInput['mailConfigId'];
        this.getDataDetail(this.mailConfigId);
        this.portalCode = this.dataInput['portalCode'];
        this.buildForm();
    }

    buildForm() {
        this.mailConfigForm = this.formBuilder.group({
            subject: [null, [Validators.required]],
            content: [null, [Validators.required]],
            code: [{value: null, disabled: true}, [Validators.required]],
        });
    }

    doClose(): any {
        this.dialogRef.close();
    }

    getDataDetail(mailConfigId: number) {
        this.loading = true;
        this.api
            .get(PORTAL_MAIL_ENDPOINT.GET_DATA_DETAIL + '/' + mailConfigId)
            .subscribe(
                (res) => {
                    this.loading = false;
                    if (res['data']) {
                        this.defaultValue(res['data']);
                    }
                },
                (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                }
            );
    }

    defaultValue(data: any) {
        this.mailConfigForm.controls['subject'].setValue(data['subject']);
        this.mailConfigForm.controls['content'].setValue(data['content']);
        this.mailConfigForm.controls['code'].setValue(data['code']);
    }

    onReady(editor: any) {
        editor.ui
            .getEditableElement()
            .parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    doSave() {
        if (this.mailConfigForm.invalid) {
            this.mailConfigForm.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }

        this.loading = true;
        let dataBody = this.mailConfigForm.getRawValue();
        dataBody['portalCode'] = this.portalCode;
        dataBody['id'] = this.mailConfigId;

        this.api.post(PORTAL_MAIL_ENDPOINT.SAVE_OR_UPDATE, dataBody).subscribe(
            (res) => {
                this.loading = false;
                this.toast.showSuccess(
                    'Thông báo',
                    'Cập nhật dữ liệu thành công'
                );
                this.dialogRef.close();
            },
            (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }
}
