import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import * as _ from 'lodash';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { ARTICLE_GROUP } from '../../../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../../../common/services/api/fetch-api.service';
import { ToastNotiService } from '../../../../../common/services/toastr/toast-noti.service';
import { ArticleCategoryModel } from './../../../../../common/model/ArticleCategoryModel';
import { FileUtils } from '../../../../../common/utils/file-utils';
import { ImagePreviewComponent } from '../../../../../common/GUI/image-preview/image-preview.component';

@Component({
    selector: 'app-portal-article-group-dialog',
    templateUrl: './portal-article-group-dialog.component.html',
    styleUrls: ['./portal-article-group-dialog.component.scss'],
})
export class PortalArticleGroupDialogComponent implements OnInit {
    @ViewChild('fileField') fileField: any;
    loading: boolean = false;
    title!: string;
    form!: FormGroup;
    formType!: string;
    lstLangByPortal: any = [];
    lstMenuByPortalAndLang: any = [];
    portalName!: string;
    oldMenuCode!: any;
    displayOrder!: any;
    oldDisplayOrder!: any;
    nextDisplayOrder!: any;
    isDisplayHome: boolean = false;
    lstArticleGroup: any = [];
    lstArticleGroupCode: any = [];
    lstArticleGroupContent: any = [];
    lstDataArticleGroupToCheck: any = [];
    lstArticleCategoryByMenu: Array<ArticleCategoryModel> = [];
    checkCode: boolean = false;
    checkContent: boolean = false;
    description!: string;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
    ];
    displayImgName!: string;
    displayImgContent!: any;

    constructor(
        private dialogRef: MatDialogRef<PortalArticleGroupDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private toast: ToastNotiService,
        private api: FetchApiService
    ) {}

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.formType = this.dataInput['type'];
        this.lstLangByPortal = this.dataInput['lstLangByPortal'];
        this.portalName = this.dataInput['portalName'];
        this.description = this.dataInput['description'];
        this.buildForm();
        this.updateForm(this.dataInput.item);
        if (this.formType === 'create') {
            this.getMaxDisplayOrder();
            this.form.controls['langCode'].setValue('VI');
            this.onChangeLangCode('VI');
        }
        this.oldDisplayOrder = this.displayOrder;

        if (this.formType !== 'create') {
            this.getCategoryArticleByMenu();
        }

        if (this.dataInput['type'] !== 'create') {
            this.lstArticleCategoryByMenu = this.dataInput['item'];
        }
    }

    buildForm() {
        this.form = this.formBuilder.group({
            id: [null],
            portalCode: [''],
            menuCode: ['', [Validators.required]],
            displayHome: [null],
            description: [''],
            langCode: ['', [Validators.required]],
            isActive: [null],
            groupType: ['', [Validators.required]],
        });

        this.form.controls['groupType'].valueChanges.subscribe((change) => {
            if (change === 1) this.isDisplayHome = true;
            else this.isDisplayHome = false;
        });
    }

    updateForm(item?: any) {
        if (!this.form) this.buildForm();
        this.form.patchValue({
            id: item ? item['id'] : null,
            portalCode: item ? item['portalCode'] : this.dataInput.portalCode,
            menuCode: item ? item['menuCode'] : '',
            displayHome: !!(item && item['displayHome'] === 1),
            langCode: item ? item['langCode'] : '',
            content: item ? item['content'] : '',
            description: item ? item['description'] : '',
            groupType: item ? item['groupType'] : '',
        });
        this.displayImgContent = item ? item.displayImg : null;
        this.displayImgName = item ? item.displayImgName : '';
        this.form.controls['portalCode'].disable();
        if (this.formType === 'detail') {
            this.form.disable();
        }
        if (this.formType === 'update') {
            this.form.controls['langCode'].disable();
            this.form.controls['menuCode'].disable();
        }
        if (this.formType !== 'create') {
            this.onChangeLangCode(this.getValueOfField('langCode'));
        }
        this.oldMenuCode = this.getValueOfField('menuCode');
    }

    getValueOfField(item: any) {
        return this.form.get(item)?.value;
    }

    setValueToField(item: any, data: any) {
        return this.form.get(item)?.setValue(data);
    }

    getCategoryArticleByMenu() {
        this.loading = true;
        let params = {
            portalCode: this.dataInput['item']['portalCode'],
            langCode: this.dataInput['item']['langCode'],
            menuCode: this.dataInput['item']['menuCode'],
            articleGroupId: this.dataInput['item']['id'],
        };
        this.api
            .post(ARTICLE_GROUP.GET_CATEGORY_ARTICLE_BY_MENU_CODE, params)
            .subscribe({
                next: (res) => {
                    this.lstArticleCategoryByMenu = res.data;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    savePortalArticleGroup() {
        if (this.form.invalid || this.lstArticleCategoryByMenu.length === 0) {
            this.form.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }

        let lstNull = _.filter(this.lstArticleCategoryByMenu, function (item) {
            return (
                typeof item.code == undefined ||
                item.code == 'undefined' ||
                !item.code ||
                !item.content
            );
        });
        if (lstNull.length !== 0) {
            this.toast.showWarning(
                'Cảnh báo',
                'Vui lòng nhập đầy đủ thông tin'
            );
            return;
        }

        let checkDuplicate = _.map(this.lstArticleCategoryByMenu, 'code');
        let flagCheck = _.filter(checkDuplicate, (val, i, iteratee) =>
            _.includes(iteratee, val, i + 1)
        );
        if (flagCheck && flagCheck.length > 0) {
            this.toast.showWarning('Cảnh báo', 'Mã chuyên mục đã bị trùng');
            return;
        }

        this.loading = true;

        let params: object = {
            id: this.getValueOfField('id'),
            portalCode: this.getValueOfField('portalCode'),
            menuCode: this.getValueOfField('menuCode'),
            displayHome: this.getValueOfField('displayHome') === true ? 1 : 0,
            langCode: this.getValueOfField('langCode'),
            groupType: this.getValueOfField('groupType'),
            isActive: this.getValueOfField('isActive'),
            lstArticleCategoryByMenu: this.lstArticleCategoryByMenu,
            displayImg: this.displayImgContent,
            displayImgName: this.displayImgName,
        };

        this.api
            .post(ARTICLE_GROUP.SAVE_PORTAL_ARTICLE_GROUP, params)
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    let lstDataResult = res['data'];
                    let lstCodeResult = _.map(lstDataResult, 'code');
                    if (res['data'].length < 1) {
                        if (this.formType == 'create') {
                            this.toast.showSuccess(
                                'Thông báo',
                                'Lưu thông tin thành công!'
                            );
                        }
                        this.doClose();
                    } else if (res['data'].length === 1) {
                        if (this.formType == 'update') {
                            this.toast.showSuccess(
                                'Thông báo',
                                'Cập nhật dữ liệu thành công!'
                            );
                            this.doClose();
                        } else if (this.formType == 'create') {
                            this.toast.showWarning(
                                'Thông báo',
                                'Mã Chuyên mục bài viết ' +
                                    lstCodeResult[0] +
                                    ' đã tồn tại, kiểm tra lại thông tin đầu vào.'
                            );
                        }
                    } else if (res['data'].length > 1) {
                        this.toast.showWarning(
                            'Thông báo',
                            'Mã Chuyên mục bài viết ' +
                                lstCodeResult[0] +
                                ' đã tồn tại, kiểm tra lại thông tin đầu vào.'
                        );
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                },
            });
    }

    doSearch() {
        this.loading = true;
        let params = {
            portalCode: this.getValueOfField('portalCode'),
            langCode: this.getValueOfField('langCode'),
            menuCode: this.getValueOfField('menuCode'),
        };
        this.api
            .post(ARTICLE_GROUP.SEARCH_FOR_PORTAL_TO_CHECK, params)
            .subscribe({
                next: (res) => {
                    this.lstDataArticleGroupToCheck = res.data['list'];
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    doAddRow() {
        let rowItem = new ArticleCategoryModel();
        rowItem.isActive = 1;
        this.lstArticleCategoryByMenu.unshift(rowItem);
        if (this.displayOrder && this.displayOrder > 0) {
            if (rowItem) {
                if (this.lstArticleCategoryByMenu.length > 1) {
                    this.nextDisplayOrder = this.displayOrder++;
                    rowItem.displayOrder = this.nextDisplayOrder;
                }
                rowItem.displayOrder = this.displayOrder;
            }
        }
    }

    doRemoveRow(item: any, index: number) {
        if (item['link']) {
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
                disableClose: true,
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result && result['rs'] === true) {
                    this.lstArticleCategoryByMenu.splice(index, 1);
                }
            });
        } else {
            if (this.lstArticleCategoryByMenu.length >= 1) {
                item['displayOrder'] = this.nextDisplayOrder--;
            } else {
                item['displayOrder'] = this.displayOrder;
            }
            this.lstArticleCategoryByMenu.splice(index, 1);
        }
    }

    doClose() {
        this.dialogRef.close();
    }

    getMaxDisplayOrder() {
        this.loading = true;
        let params: object = {
            portalCode: this.dataInput.portalCode,
        };
        this.api.post(ARTICLE_GROUP.MAX_DISPLAY_ORDER, params).subscribe(
            (res) => {
                this.loading = false;
                if (res['data'] !== null) {
                    this.displayOrder = res['data'] + 1;
                }
            },
            (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }

    onChangeLangCode(value?: any) {
        if (value) {
            this.loading = true;
            let params: object = {
                portalCode: this.dataInput.portalCode,
                langCode: this.getValueOfField('langCode'),
            };
            this.api
                .post(ARTICLE_GROUP.LIST_MENU_BY_PORTAL_AND_LANG, params)
                .subscribe({
                    next: (res) => {
                        this.loading = false;
                        if (res['data'] && res['data'].length > 0) {
                            this.lstMenuByPortalAndLang = res['data'];
                            this.lstMenuByPortalAndLang.forEach((item: any) => {
                                item.name = item.name.replace(
                                    /<br\s*\/?>/gi,
                                    ' '
                                );
                            });
                        } else {
                            this.lstMenuByPortalAndLang = [];
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
            this.lstMenuByPortalAndLang = [];
            this.setValueToField('menuCode', null);
        }
    }

    changeFile(event: any) {
        if (event && event[0]) {
            if (!_.includes(this.acceptTypeImage, event[0].type)) {
                this.toast.showWarning(
                    'Chỉ được upload file có định dạng ảnh!'
                );
                return;
            } else {
                this.displayImgName = event[0].name;
                let fileUtils = new FileUtils();
                fileUtils.convertFileToBase64(event[0]).subscribe((base64) => {
                    this.displayImgContent = base64;
                });
            }
        }
    }

    doUploadDialog() {
        let param: object = {
            imgName: this.displayImgName,
            title: this.displayImgName,
            loading: false,
            fileContent: this.displayImgContent,
        };
        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: param,
            disableClose: true,
        });
    }

    removeFile() {
        this.displayImgName = '';
        this.displayImgContent = '';
        this.fileField.nativeElement.value = '';
    }
}
