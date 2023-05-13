import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UsersComponent} from "../users.component";
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {User} from "../../../../common/model/UserModel";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {REGEX_PATERN} from "../../../../common/enum/ERegexPatern";
import {USERS_ENDPOINT} from "../../../../common/enum/EApiUrl";

@Component({
    selector: 'app-user-dialog',
    templateUrl: './user-dialog.component.html',
    styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    formType!: string;
    form!: FormGroup;
    lstRole: any = [];

    constructor(
        private dialogRef: MatDialogRef<UsersComponent>,
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
        this.getListRole();
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            userId: [null],
            userName: ['', [Validators.required, Validators.pattern(REGEX_PATERN.USERNAME), Validators.maxLength(70)]],
            email: ['', [Validators.required, Validators.pattern(REGEX_PATERN.EMAIL), Validators.maxLength(40)]],
            roleCode: ['', [Validators.required]],
        })
    }

    updateForm(user: User) {
        if (!this.form) this.buildForm();
        this.form.patchValue({
            userId: user ? user['userId'] : null,
            userName: user ? user['userName'] : null,
            email: user ? user['email'] : null,
            roleCode: user ? user['roleCode'] : null,
        });
        if (this.formType === 'update') {
            this.form.controls['userName'].disable();
        }
        if (this.formType === 'detail') {
            this.form.controls['userName'].disable();
            this.form.controls['email'].disable();
            this.form.controls['roleCode'].disable();
        }
    }

    getValueOfField(item: any) {
        return this.form.get(item)?.value;
    }

    setValueToField(item: any, data: any) {
        return this.form.get(item)?.setValue(data);
    }

    doClose(): any {
        this.dialogRef.close();
    }

    doSave(): any {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }
        this.loading = true;
        let params: object = {
            id: this.getValueOfField('userId'),
            userName: this.getValueOfField('userName'),
            mailTo: this.getValueOfField('email'),
            roleCode: this.getValueOfField('roleCode'),
        };
        this.api.post(USERS_ENDPOINT.SAVE_OR_UPDATE, params).subscribe((res) => {
                this.loading = false;
                if (res.data === 0) {
                    this.toast.showSuccess(
                        'Thông báo',
                        this.formType === 'create' ? 'Thêm mới dữ liệu thành công' : 'Cập nhật dữ liệu thành công'
                    );
                    this.doClose();
                } else {
                    if (res.data === 1) {
                        this.toast.showInfo(
                            'Thông báo',
                            'Tên đăng nhập đã tồn tại, kiểm tra lại thông tin đầu vào.'
                        );
                    } else {
                        this.toast.showInfo(
                            'Thông báo',
                            'Email đã tồn tại, kiểm tra lại thông tin đầu vào.'
                        );
                    }
                }
            }, (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        )
    }

    private getListRole() {
        this.api.get(USERS_ENDPOINT.GET_LIST_ROLE).subscribe((res) => {
            if (res) {
                this.lstRole = res.data;
            }
        }, (error) => {
            this.toast.showError(error.message ? error.message : error);
        });
    }
}
