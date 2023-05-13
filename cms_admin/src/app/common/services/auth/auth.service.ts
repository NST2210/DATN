import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private router: Router) {}

    authenticate(oauth2: any) {
        sessionStorage.removeItem(environment.accessToken);
        sessionStorage.setItem(environment.accessToken, oauth2.access_token);

        const decoded: any = jwt_decode(oauth2.access_token);
        const userInfo = JSON.parse(decoded.user_name);
        sessionStorage.setItem(environment.userInfo, JSON.stringify(userInfo));

        this.router.navigate(['home']);
    }

    isTokenExpired(): boolean {
        let token = sessionStorage.getItem(environment.accessToken);
        const date = this.getTokenExpirationDate(token);
        if (date === undefined) return false;
        return !(date.valueOf() > new Date().valueOf());
    }

    getTokenExpirationDate(token: any): any {
        const decoded: any = jwt_decode(token);
        if (decoded.exp !== undefined) {
            return null;
        }
        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }

    getUserInfo(): any {
        let userInfo = sessionStorage.getItem(environment.userInfo);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }

    getUserMenu(): any {
        let strUserInfo = sessionStorage.getItem(environment.userInfo);
        if (strUserInfo) {
            let userInfo = JSON.parse(strUserInfo);
            let userMenu = userInfo['menus'];

            let menus: any = [];
            _.forEach(userMenu, function (obj) {
                let item: any = {
                    name: obj['name'],
                    url: obj['url'],
                    iconComponent: { name: obj['iconName'] },
                };

                if (obj['children']) {
                    item['children'] = obj['children'];
                }

                menus.push(item);
            });
            return menus;
        }
    }

    getMenuInfo(): any {
        let strUserInfo = sessionStorage.getItem(environment.userInfo);
        if (strUserInfo) {
            let userInfo = JSON.parse(strUserInfo);
            return userInfo['menus'];
        }
    }
}
