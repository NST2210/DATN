import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
    constructor(
    ) {
    }

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
                    message = `Error Status: ${error.status}\nMessage: ${error.message}`;
                }


                return throwError(() => new Error(message));
            })
        );
    }

    addAuthToken(request: HttpRequest<any>) {
        let reqClone = request.clone({
                url: environment.apiUrl  + request.url
            });
            return reqClone;
    }
}
