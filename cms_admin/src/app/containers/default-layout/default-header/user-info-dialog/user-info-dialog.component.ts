import {USERS_ENDPOINT} from 'src/app/common/enum/EApiUrl';
import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaptchaModel} from 'src/app/common/model/CaptchaModel';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {AuthService} from 'src/app/common/services/auth/auth.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {REGEX_PATERN} from "../../../../common/enum/ERegexPatern";

@Component({
    selector: 'app-user-info-dialog',
    templateUrl: './user-info-dialog.component.html',
    styleUrls: ['./user-info-dialog.component.scss'],
})
export class UserInfoDialogComponent implements OnInit {
    loading: boolean = false;
    form!: FormGroup;
    hideOldPass: boolean = true;
    hideNewPass: boolean = true;
    base64Captcha!: string;
    captchaRes: CaptchaModel = new CaptchaModel();
    submitted: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<UserInfoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private fb: FormBuilder,
        private auth: AuthService,
        private authService: AuthService,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        this.buildForm();
        this.getCurrentInfo();
        this.getCaptcha();
    }

    buildForm() {
        this.form = this.fb.group({
            userName: [''],
            email: [''],
            roleName: [''],
            oldPass: ['', [Validators.required]],
            newPass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(REGEX_PATERN.PASSWORD)]],
            captcha: ['', [Validators.required]],
        });
    }

    getCurrentInfo(): any {
        this.loading = true;
        this.api.get(USERS_ENDPOINT.CURRENT_USER, {
            userName: this.auth.getUserInfo().userName,
        }).subscribe((res) => {
                this.loading = false;
                this.updateForm(res.data);
            }, () => {
                this.loading = false;
            }
        );
    }

    updateForm(item?: any) {
        if (!this.form) this.buildForm();
        this.form.patchValue({
            userName: item && item['userName'] ? item['userName'] : '',
            email: item && item['email'] ? item['email'] : '',
            roleName: item && item['roleName'] ? item['roleName'] : '',
        })
        this.form.controls['userName'].disable();
        this.form.controls['email'].disable();
        this.form.controls['roleName'].disable();
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

    doChangePass() {
        this.submitted = true;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.showWarning('Cảnh báo', 'Kiểm tra lại thông tin đầu vào');
            return;
        }
        if (this.getValueOfField('oldPass') == this.getValueOfField('newPass')) {
            this.toast.showWarning('Cảnh báo', 'Mật khẩu mới không được trùng mật khẩu cũ');
            return;
        }
        let params = this.form.value;
        this.captchaRes['answer'] = this.getValueOfField('captcha');
        params['captcha'] = this.captchaRes;
        params['userName'] = this.getValueOfField('userName');
        this.loading = true;
        this.api.post(USERS_ENDPOINT.CHANGE_PASS, params).subscribe(
            (res) => {
                this.loading = false;
                if (res) {
                    if (res.data === 1) {
                        this.toast.showSuccess('Thông báo', 'Đổi mật khẩu thành công');
                        this.doClose();
                    } else {
                        this.toast.showWarning('Thông báo', 'Mật khẩu cũ sai, vui lòng kiểm tra lại thông tin!');
                    }
                } else {
                    this.toast.showWarning('Thông báo', ' Mã captcha sai, vui lòng kiểm tra lại thông tin!');
                    this.getCaptcha();
                }
            },
            () => {
                this.loading = false;
            }
        );
    }

    getCaptcha(): any {
        this.loading = true;
        this.api.get('login/captcha').subscribe((res) => {
                this.loading = false;
                this.captchaRes = res;
                this.base64Captcha = res['base64Captcha'];
            }, () => {
                this.loading = false;
            }
        );
    }
}
