import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FetchApiService} from "../../../../common/services/api/fetch-api.service";
import {ToastNotiService} from "../../../../common/services/toastr/toast-noti.service";
import {RolesComponent} from "../roles.component";
import {ROLES_ENDPOINT} from "../../../../common/enum/EApiUrl";
import {REGEX_PATERN} from "../../../../common/enum/ERegexPatern";

@Component({
    selector: 'app-roles-dialog',
    templateUrl: './roles-dialog.component.html'
})
export class RolesDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    formType!: string;
    form!: FormGroup;

    constructor(
        private dialogRef: MatDialogRef<RolesComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.buildForm();
        this.title = this.dataInput["title"];
        this.formType = this.dataInput.formType;
        this.updateForm(this.dataInput.data);
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            id: [null],
            roleCode: ['', [Validators.required, Validators.pattern(REGEX_PATERN.ROLES), Validators.maxLength(30)]],
            roleName: ['', [Validators.required, Validators.maxLength(70)]],
        })
    }

    updateForm(roles: any) {
        if (!this.form) this.buildForm();
        this.form.patchValue({
            id: roles ? roles['id'] : null,
            roleCode: roles ? roles['code'] : null,
            roleName: roles ? roles['name'] : null,
        });
        if (this.formType === 'update') {
            this.form.controls['roleCode'].disable();
        }
    }

    getValueOfField(item: any) {
        return this.form.get(item)?.value;
    }

    setValueToField(item: any, data: any) {
        return this.form.get(item)?.setValue(data);
    }

    onClose(): any {
        this.dialogRef.close();
    }

    onSave() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.showWarning('Cảnh báo', 'Kiểm tra lại thông tin đầu vào');
            return;
        }
        this.loading = true;
        let params: object = {
            id: this.getValueOfField('id'),
            code: this.getValueOfField('roleCode').toUpperCase(),
            name: this.getValueOfField('roleName'),
        };
        this.api.post(ROLES_ENDPOINT.SAVE_OR_UPDATE, params).subscribe((res) => {
                this.loading = false;
                if (res.data === 0) {
                    this.toast.showSuccess(
                        'Thông báo',
                        this.formType === 'create' ? 'Thêm mới dữ liệu thành công' : 'Cập nhật dữ liệu thành công'
                    );
                    this.onClose();
                } else {
                    this.toast.showInfo('Thông báo', 'Mã quyền đã tồn tại, kiểm tra lại thông tin đầu vào.');
                }
            }, (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        )
    }
}
