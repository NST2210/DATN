import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FetchApiService {
    constructor(private http: HttpClient) {}

    get(strUrl: string, param?: any, responseType?: any): Observable<any> {
        return this.http.get(strUrl, {
            params: param,
            responseType: responseType || 'json',
        });
    }

    post(strUrl: string, paramBody?: any, param?: any): Observable<any> {
        return this.http.post(strUrl, paramBody, {
            params: param,
            responseType: 'json',
        });
    }
    uploadFile(strUrl: string, params: any): Observable<any> {
        return this.http.post(strUrl, params);
    }
}
