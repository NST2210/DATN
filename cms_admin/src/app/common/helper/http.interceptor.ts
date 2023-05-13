import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth/auth.service';
import { ToastNotiService } from './../services/toastr/toast-noti.service';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private auth: AuthService,
        private toast: ToastNotiService
    ) {}

    intercept(
        httpRequest: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(this.addAuthToken(httpRequest)).pipe(
            retry(1),
            catchError((error: HttpErrorResponse) => {
                let message = '';
                if (error.error instanceof ErrorEvent) {
                    // handle client-side error
                    message = `Error: ${error.error.message}`;
                } else {
                    // handle server-side error
                    message = `Message: ${error.message}`;
                }
                if (error['status'] === 401 || error['status'] === 403) {
                    this.toast.showWarning(
                        'Thông báo',
                        'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại hệ thống.'
                    );
                    this.router.navigate(['/login']);
                } else {
                    let pathUrl: string = error.url ? error.url : '';
                    if (pathUrl.includes('login')) {
                        let msg;
                        switch (error.error) {
                            case 'USER_NOT_FOUND':
                                msg = 'Tên đăng nhập không tồn tại';
                                break;
                            case 'PASSWORD_OR_ACCOUNT_IN_ACTIVE':
                                msg =
                                    'Mật khẩu không đúng hoặc tài khoản đang bị khoá';
                                break;
                            case 'captcha.invalid':
                                msg = 'Mã bảo mật không đúng';
                                break;
                        }
                        this.toast.showWarning('Thông báo', msg);
                    } else {
                        this.toast.showError(
                            'Lỗi',
                            'Có lỗi phát sinh:<br>Vui lòng liên hệ bộ phận IT để được hỗ trợ.'
                        );
                    }
                }

                return throwError(() => new Error(error.error));
            })
        );
    }

    addAuthToken(request: HttpRequest<any>) {
        let token: any = sessionStorage.getItem(environment.accessToken);

        let reqClone: any;

        if (request.url.includes('login')) {
            reqClone = request.clone({
                url: environment.apiUrl + request.url,
            });
            return reqClone;
        } else {
            reqClone = request.clone({
                url: environment.apiUrl + 'oauth/' + request.url,
            });
        }

        return reqClone.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}
