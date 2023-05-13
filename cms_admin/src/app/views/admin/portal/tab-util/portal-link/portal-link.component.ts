import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DialogCommonComponent} from 'src/app/common/GUI/dialog-common/dialog-common.component';
import {LanguagePortalModel} from 'src/app/common/model/LanguagePortalModel';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {LinkedModel} from '../../../../../common/model/LinkedModel';
import {FormGroup} from "@angular/forms";
import * as _ from 'lodash';

@Component({
    selector: 'portal-link',
    templateUrl: './portal-link.component.html',
    styleUrls: ['./portal-link.component.scss'],
})
export class PortalLinkComponent implements OnInit {
    @Input() portalInfo: any;
    @Input() userInfo: any;
    @Input() langItem: LanguagePortalModel = new LanguagePortalModel();
    @Input() listPortalLink: Array<LinkedModel> = [];
    loading: boolean = false;
    checkDuplicate: boolean = true;
    listTitle: any;
    form!: FormGroup;

    constructor(
        private api: FetchApiService,
        private toast: ToastNotiService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
    }

    ngOnChanges() {

    }

    doAddRow() {
        if (this.checkDuplicate) {
            let rowItem = new LinkedModel();
            rowItem.portalCode = this.portalInfo['code'];
            rowItem.langCode = this.langItem['langCode'];
            rowItem.isActive = 1;
            this.listPortalLink.unshift(rowItem);
        } else {
            this.toast.showWarning("Tên hiển thị đã bị trùng, vui lòng nhập tên hiển thị khác!");
        }
    }

    doRemoveRow(item: any, index: number) {
        if (item['id']) {
            let param: Object = {
                title: 'Xác nhận xóa',
                message:
                    'Bạn có muốn xóa dữ liệu <strong>' +
                    item['title'] +
                    '&nbsp;(' +
                    item['link'] +
                    ')' +
                    '</strong>?',
            };
            const dialogRef = this.dialog.open(DialogCommonComponent, {
                width: '30%',
                data: param,
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result && result['rs'] === true) {
                    this.listPortalLink.splice(index, 1);
                    this.listTitle.splice(index, 1);
                    this.checkDuplicate = true;
                }
            });
        } else {
            this.listPortalLink.splice(index, 1);
            this.listTitle.splice(index, 1);
            this.checkDuplicate = true;
        }
    }

    checkDupl(a: any) {
        return _.uniq(a).length !== a.length;
    }
      

    onChangeTitle() {
        this.listTitle = _.compact(_.map(this.listPortalLink, 'title')); 
        if (this.listTitle.length > 0 && this.checkDupl(this.listTitle)) { 
            this.toast.showWarning("Tên hiển thị đã bị trùng, vui lòng nhập tên hiển thị khác!");
            this.checkDuplicate = false;
        } else {
            this.checkDuplicate = true;
        }
    }
}
