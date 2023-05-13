import { Component, OnInit } from '@angular/core';
import {
    Router,
    Event,
    NavigationStart,
    NavigationEnd,
    NavigationError,
} from '@angular/router';
import { AuthService } from 'src/app/common/services/auth/auth.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit {
    items: any = [];

    constructor(private router: Router, private auth: AuthService) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                if (event.url === '/home') {
                    this.items = [{ label: 'Trang chủ', url: '/home' }];
                } else {
                    this.menuName(event.url);
                }
            }
        });
    }

    ngOnInit(): void {}

    menuName(url: string) {
        let menuDb = this.auth.getMenuInfo();

        let menuInfo = _(menuDb)
            .thru(function (coll) {
                return _.union(coll, _.map(coll, 'children') || []);
            })
            .flatten()
            .find({ url: url });

        if (menuInfo) {
            this.items = [
                { label: 'Trang chủ', url: '/home' },
                { label: menuInfo['name'], url: menuInfo['url'] },
            ];
        }
    }
}
