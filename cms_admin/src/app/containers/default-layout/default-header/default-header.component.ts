import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ClassToggleService, HeaderComponent} from '@coreui/angular';
import {AuthService} from '../../../common/services/auth/auth.service';
import {UserInfoDialogComponent} from './user-info-dialog/user-info-dialog.component';

@Component({
    selector: 'app-default-header',
    templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
    @Input() sidebarId: string = 'sidebar';

    public newMessages = new Array(4);
    public newTasks = new Array(5);
    public newNotifications = new Array(5);
    userInfo!: any;

    constructor(
        private classToggler: ClassToggleService,
        private authService: AuthService,
        private dialog: MatDialog
    ) {
        super();
    }

    ngOnInit() {
        this.userInfo = this.authService.getUserInfo();
    }

    openDialog(): void {
        this.dialog.open(UserInfoDialogComponent, {
            width: '40%',
        });
    }
}
