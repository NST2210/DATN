import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

import {IconSetService} from '@coreui/icons-angular';
import {iconSubset} from './icons/icon-subset';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'body',
    template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
    title = 'CMS VDSS';

    constructor(
        private router: Router,
        private titleService: Title,
        private iconSetService: IconSetService
    ) {
        titleService.setTitle(this.title);
        iconSetService.icons = {...iconSubset};
    }

    ngOnInit(): void {
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
        });
    }
}
