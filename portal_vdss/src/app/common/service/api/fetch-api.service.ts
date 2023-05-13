import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FetchApiService {
    constructor(private http: HttpClient) { }

    get(strUrl: string, param?: any): Observable<any> {
        return this.http.get(strUrl, {
            params: param,
            responseType: 'json',
        });
    }

    post(strUrl: string, paramBody?: any, param?: any): Observable<any> {
        return this.http.post(strUrl, paramBody, {
            params: param,
            responseType: 'json',
        });
    }
}

