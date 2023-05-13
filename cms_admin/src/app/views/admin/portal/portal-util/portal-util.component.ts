import {
    Component,
    Inject,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { LanguagePortalModel } from 'src/app/common/model/LanguagePortalModel';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { AuthService } from 'src/app/common/services/auth/auth.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import * as _ from 'lodash';
import {
    LANGUAGE_ENDPOINT,
    LINKED,
    PORTAL_INFO_ENDPOINT,
    PORTAL_LANGUAGE_DETAIL,
} from 'src/app/common/enum/EApiUrl';
import { LinkedModel } from '../../../../common/model/LinkedModel';
import { PortalLangDetailModel } from '../../../../common/model/PortalLangDetailModel';

@Component({
    selector: 'app-portal-util',
    templateUrl: './portal-util.component.html',
    styleUrls: ['./portal-util.component.scss'],
})
export class PortalUtilComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    portalInfo!: any;
    tabSelected: number = 0;
    userInfo!: any;
    listTitle: any;

    //lang data
    dataLangList: Array<LanguagePortalModel> = [];
    langs: any = [];
    langChoice: LanguagePortalModel = new LanguagePortalModel();

    //General info
    listPortalLink: Array<LinkedModel> = [];
    footerDetail: PortalLangDetailModel = new PortalLangDetailModel();

    constructor(
        private dialogRef: MatDialogRef<PortalUtilComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        public dialog: MatDialog,
        private toast: ToastNotiService,
        private auth: AuthService
    ) {
        this.userInfo = this.auth.getUserInfo();
    }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.portalInfo = this.dataInput['item'];

        this.getAllLanguage();
        this.getLanguageForPortal();
    }

    getAllLanguage() {
        this.loading = true;
        this.api.get(LANGUAGE_ENDPOINT.GET_ALL).subscribe({
            next: (res) => {
                this.loading = false;
                this.langs = res.data;
            },
            error: () => {
                this.loading = false;
            },
        });
    }

    getLanguageForPortal() {
        this.loading = true;
        this.api
            .get(PORTAL_INFO_ENDPOINT.GET_LANGUAGE_PORTAL, {
                portalCode: this.portalInfo['code'],
            })
            .subscribe({
                next: (res) => {
                    this.dataLangList = res.data;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    doRemoveRowLang(item: any, index: number) {
        if (item['langName']) {
            let param: Object = {
                title: 'Xác nhận xóa',
                message:
                    'Bạn có muốn xóa dữ liệu <strong>' +
                    item['langName'] +
                    '</strong>?',
            };
            const dialogRef = this.dialog.open(DialogCommonComponent, {
                width: '30%',
                data: param,
                disableClose: true,
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result && result['rs'] === true) {
                    //call api check xem ngon ngu dang dung thi khong duoc xoa
                    this.loading = true;
                    let params: object = {
                        portalCode: this.portalInfo['code'],
                        langCode: item['langCode'],
                    };
                    this.api
                        .post(
                            PORTAL_INFO_ENDPOINT.GET_LIST_LANGUAGE_IN_USE,
                            params
                        )
                        .subscribe({
                            next: (res) => {
                                this.loading = false;
                                if (res['data'] && res['data'].length > 0) {
                                    this.toast.showWarning(
                                        'Thông báo',
                                        'Ngôn ngữ đang được sử dụng!'
                                    );
                                    return;
                                } else {
                                    this.dataLangList.splice(index, 1);
                                }
                            },
                            error: (error) => {
                                this.loading = false;
                                this.toast.showError(
                                    error.message ? error.message : error
                                );
                            },
                        });
                }
            });
        } else {
            this.dataLangList.splice(index, 1);
        }

        if (this.dataLangList.length === 1) {
            this.dataLangList[0]['isDefault'] = 1;
        }

        //truong hop neu xoa thang default di thi default cho 1 thang da chon ngon ngu ngau nhien
        let dataDefault = _.filter(this.dataLangList, (obj) => {
            return obj.isDefault === 1;
        });
    }

    doEditDetailByLang(item: any) {
        if (item.portalLangId > 0) {
            this.langChoice = _.cloneDeep(item);
            this.dataLangList.forEach((obj) => {
                if (obj['portalLangId'] === item['portalLangId']) {
                    obj['choiceActive'] = true;
                } else {
                    obj['choiceActive'] = false;
                }
            });
            this.getDataFooter();
            this.getLinkedByPortal();
        }
    }

    onChangeLanguage(rowItem: LanguagePortalModel, value: any, index: number) {
        let langCheck = _.filter(this.dataLangList, (obj, i) => {
            return obj['langCode'] === value && i !== index && value !== '-1';
        });

        if (langCheck && langCheck.length > 0) {
            this.toast.showWarning('Cảnh báo', 'Ngôn ngữ được chọn đã tồn tại');
        }

        //check default
        let dataDefault = _.filter(this.dataLangList, (obj) => {
            return obj.isDefault === 1;
        });

        if (dataDefault.length === 0) {
            rowItem.isDefault = 1;
        }
    }

    doNewLang() {
        this.dataLangList.unshift(this.newLangItem());
    }

    newLangItem(): LanguagePortalModel {
        let itemRow = new LanguagePortalModel();
        itemRow.displayOrder = this.dataLangList.length + 1;
        itemRow.langCode = '-1';
        itemRow.portalLangId = -1 * new Date().getTime();

        if (this.dataLangList.length === 0) {
            itemRow.isDefault = 1;
        }

        return itemRow;
    }

    onChangeLangDefault(item: any, value: any) {
        if (value) {
            this.dataLangList.forEach((obj) => {
                if (obj['portalLangId'] === item['portalLangId']) {
                    obj['isDefault'] = 1;
                } else {
                    obj['isDefault'] = 0;
                }
            });
        }
    }

    doSaveLang() {
        //check trung ngon ngu
        let langEmpty = _.filter(this.dataLangList, (obj) => {
            return obj.langCode === '-1';
        });

        if (langEmpty && langEmpty.length > 0) {
            this.toast.showWarning('Cảnh báo', 'Chưa chọn ngôn ngữ');
            return;
        }
        let checkDuplicate = _.map(this.dataLangList, 'langCode');
        let flagCheck = _.filter(checkDuplicate, (val, i, iteratee) =>
            _.includes(iteratee, val, i + 1)
        );
        if (flagCheck && flagCheck.length > 0) {
            this.toast.showWarning('Cảnh báo', 'Ngôn ngữ chọn đã bị trùng');
            return;
        }

        this.loading = true;
        let params: object = {
            portalCode: this.portalInfo['code'],
            lstLangPortal: this.dataLangList,
        };
        this.api
            .post(PORTAL_INFO_ENDPOINT.SAVE_PORTAL_UTIL_LANGUAGE, params)
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    if (res['data'] === 0) {
                        this.toast.showSuccess(
                            'Thông báo',
                            'Lưu thông tin thành công!'
                        );
                        this.getLanguageForPortal();
                    } else {
                        this.toast.showError(
                            'Thông báo',
                            'Lưu thông tin thất bại!'
                        );
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                },
            });
    }

    doClose(): void {
        this.dialogRef.close();
    }

    getDataFooter() {
        this.loading = true;
        this.api
            .get(PORTAL_LANGUAGE_DETAIL.GET_FOOTER_INFO_FROM_PORTAL, {
                portalCode: this.portalInfo['code'],
                langCode: this.langChoice['langCode'],
            })
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    if (res['data'] !== null) {
                        this.footerDetail = res.data;
                    } else {
                        this.footerDetail = new PortalLangDetailModel();
                    }
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    getLinkedByPortal() {
        this.loading = true;
        this.api
            .get(LINKED.GET_BY_PORTAL_AND_LANG_CODE, {
                portalCode: this.portalInfo['code'],
                langCode: this.langChoice['langCode'],
            })
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    if (res.data && res.data.length > 0) {
                        this.listPortalLink = res.data;
                    } else {
                        this.listPortalLink = [];
                    }
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    checkDupl(a: any) {
        return _.uniq(a).length !== a.length;
    }

    doSavePortalUtilInfo() {
        this.loading = true;
        let params: object = {
            portalCode: this.portalInfo['code'],
            langCode: this.langChoice['langCode'],
            listPortalLink: this.listPortalLink,
            footerDetail: this.footerDetail,
        };
        let objectValidate = _.filter(this.listPortalLink, function (o) {
            return !o.title || !o.link;
        });
        this.listTitle = _.map(this.listPortalLink, 'title');
        if (objectValidate.length == 0) {
            if (!this.checkDupl(this.listTitle)) {
                this.api
                    .post(PORTAL_INFO_ENDPOINT.SAVE_PORTAL_UTIL_INFO, params)
                    .subscribe({
                        next: (res) => {
                            this.loading = false;
                            if (res['data'] === 0) {
                                this.getDataFooter();
                                this.getLinkedByPortal();
                                this.toast.showSuccess(
                                    'Thông báo',
                                    'Lưu thông tin thành công!'
                                );
                            } else {
                                this.toast.showWarning(
                                    'Thông báo',
                                    'Lưu thông tin thất bại!'
                                );
                            }
                        },
                        error: (error) => {
                            this.loading = false;
                            this.toast.showError(
                                error.message ? error.message : error
                            );
                        },
                    });
            } else {
                this.loading = false;
                this.toast.showWarning(
                    'Thông báo',
                    'Tên hiển thị đã bị trùng, Vui lòng nhập tên hiển thị khác!'
                );
            }
        } else {
            this.loading = false;
            this.toast.showWarning(
                'Thông báo',
                'Vui lòng nhập Tên hiển thị và Link liên kết!'
            );
        }
    }
}
