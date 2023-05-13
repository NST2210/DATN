import {Component} from '@angular/core';
import {AuthService} from 'src/app/common/services/auth/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
    public navItems = [];
    columnsView: any = [];

    public perfectScrollbarConfig = {
        suppressScrollX: true,
    };

    constructor(private auth: AuthService) {
        this.columnsView = this.auth.getUserMenu();
        this.columnsView.forEach((obj: any) => {
            if(obj['url'] === '') {
                obj['url'] = null;
            }
            this.navItems = this.columnsView;
        });
    }
}
