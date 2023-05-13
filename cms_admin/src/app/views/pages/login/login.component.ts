import { ToastNotiService } from '../../../common/services/toastr/toast-noti.service';
import { CaptchaModel } from '../../../common/model/CaptchaModel';
import { AuthService } from '../../../common/services/auth/auth.service';
import { FetchApiService } from '../../../common/services/api/fetch-api.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { REGEX_PATERN } from '../../../common/enum/ERegexPatern';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading: boolean = false;
    captchaRes: CaptchaModel = new CaptchaModel();
    base64Captcha!: string;
    submitted: boolean = false;
    forgotForm!: FormGroup;

    showFormLogin: boolean = true;
    hide: boolean = true;

    constructor(
        private api: FetchApiService,
        private fb: FormBuilder,
        private auth: AuthService,
        private toast: ToastNotiService
    ) {}

    ngOnInit() {
        this.buildForm();
        this.buildFormForgot();
        this.getCaptcha();
    }

    buildForm() {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            captcha: ['', [Validators.required]],
        });
    }

    buildFormForgot() {
        this.forgotForm = this.fb.group({
            email: [
                '',
                [Validators.required],
                Validators.pattern(REGEX_PATERN.EMAIL),
            ],
            captcha: ['', [Validators.required]],
        });
    }

    get f() {
        return this.loginForm.controls;
    }

    doLogin() {
        this.submitted = true;
        if (this.loginForm.controls['username'].invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập tên đăng nhập');
            return;
        }
        if (this.loginForm.controls['password'].invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập mật khẩu ');
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

        this.api.post('login', bodyParam).subscribe(
            (res) => {
                if (!res) {
                    this.getCaptcha();
                } else {
                    this.auth.authenticate(res);
                }
                this.loading = false;
            },
            () => {
                this.getCaptcha();
                this.loading = false;
            }
        );
    }

    getCaptcha(): any {
        this.api.get('login/captcha').subscribe(
            (res) => {
                this.captchaRes = res;
                this.base64Captcha = res['base64Captcha'];
            },
            () => {}
        );
    }

    doFogotPass() {
        this.getCaptcha();
        this.showFormLogin = !this.showFormLogin;
    }

    doSendForgot() {
        this.submitted = true;
        if (this.forgotForm.controls['email'].invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập email ');
            return;
        }
        if (this.forgotForm.controls['captcha'].invalid) {
            this.toast.showWarning('Thông báo', 'Vui lòng nhập mã captcha');
            return;
        }

        this.loading = true;
        let bodyParam = this.forgotForm.value;

        this.captchaRes['answer'] = this.forgotForm.controls['captcha'].value;
        bodyParam['captcha'] = this.captchaRes;

        this.api.post('login/forgotPass', bodyParam).subscribe(
            (res) => {
                this.loading = false;
                if (res === 0) {
                    this.toast.showWarning(
                        'Thông báo',
                        'Mã bảo mật không đúng'
                    );
                } else if (res === 1) {
                    this.toast.showSuccess(
                        'Thông báo',
                        'Mật khẩu mới được gửi về mail <strong>' +
                            bodyParam['email'] +
                            '</strong>'
                    );
                    this.doFogotPass();
                } else if (res === 3) {
                    this.toast.showWarning(
                        'Thông báo',
                        'Email chưa được đăng ký tài khoản'
                    );
                } else {
                    this.toast.showWarning(
                        'Thông báo',
                        'Có lỗi phát sinh. Vui lòng thực hiện lại.'
                    );
                }
            },
            () => {
                this.loading = false;
            }
        );
    }
}
