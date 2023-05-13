import {USERS_ENDPOINT} from 'src/app/common/enum/EApiUrl';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CaptchaModel} from 'src/app/common/model/CaptchaModel';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {AuthService} from 'src/app/common/services/auth/auth.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {REGEX_PATERN} from 'src/app/common/enum/ERegexPatern';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
    loginForm!: FormGroup;
    loading: boolean = false;
    captchaRes: CaptchaModel = new CaptchaModel();
    base64Captcha!: string;
    submitted: boolean = false;

    constructor(
        private api: FetchApiService,
        private fb: FormBuilder,
        private auth: AuthService,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit() {
        this.buildForm();
        this.getCaptcha();
    }

    buildForm() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required], Validators.pattern(REGEX_PATERN.EMAIL)],
            captcha: ['', [Validators.required]],
        });
    }

    get f() {
        return this.loginForm.controls;
    }

    doResetPass() {
        this.submitted = true;
        if (this.loginForm.controls['email'].invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập email ');
            return;
        }
        if (this.loginForm.controls['captcha'].invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập mã captcha');
            return;
        }

        this.loading = true;
        let bodyParam = this.loginForm.value;

        this.captchaRes['answer'] = this.loginForm.controls['captcha'].value;
        bodyParam['captcha'] = this.captchaRes;

        this.api.post(USERS_ENDPOINT.RESET_PASS, bodyParam).subscribe(
            (res) => {
                if (!res) {
                    this.toast.showWarning(
                        'Thông báo',
                        'Thông tin đăng nhập không hợp lệ'
                    );
                    this.getCaptcha();
                } else {
                    this.auth.authenticate(res);
                }
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }

    getCaptcha(): any {
        this.api.get('login/captcha').subscribe(
            (res) => {
                this.captchaRes = res;
                this.base64Captcha = res['base64Captcha'];
            }
        );
    }
}
