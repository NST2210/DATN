import { ArticleAttachComponent } from './../article-attach/article-attach.component';
import {
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as _ from 'lodash';
import {
    ARTICLE_DETAIL,
    ARTICLE_GROUP,
    LANGUAGE_ENDPOINT,
    PORTAL_FLOW,
    UTILS,
} from 'src/app/common/enum/EApiUrl';
import { ImagePreviewComponent } from 'src/app/common/GUI/image-preview/image-preview.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { AuthService } from 'src/app/common/services/auth/auth.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import Adapter from 'src/app/common/enum/ckeditorAdapter';
import { UploadImagesDialogComponent } from 'src/app/views/article-detail-info/upload-images-dialog/upload-images-dialog.component';
import { FileUtils } from '../../../common/utils/file-utils';
import { PreviewWordComponent } from '../preview-word/preview-word.component';
import { ARTICLE_STATUS } from '../../../common/enum/article-status';

@Component({
    selector: 'app-article-dialog',
    templateUrl: './article-dialog.component.html',
    styleUrls: ['./article-dialog.component.scss'],
})
export class ArticleDialogComponent implements OnInit {
    @ViewChild('fileField') fileField: any;
    @ViewChild('fileWordImport') fileWordImport!: ElementRef<HTMLInputElement>;
    loading: boolean = false;
    title!: string;
    Editor = DecoupledEditor;
    content!: string;
    portalCode!: string;
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];
    flowStepFirst!: any;
    lstFlowStep: any = [];
    lstNameFlowStep: any = [];
    articleForm!: FormGroup;
    imgDisplay!: any;
    imgDisplayName!: string;
    flowStepCurrent!: any;
    checkApproveLast!: any;
    userInfo!: any;
    publicationTime!: Date;
    langCode!: string;
    fileWordOrigin!: any;
    menuCode!: string;
    lstImgUpload: any = [];
    articleOrigin!: string;
    enableSaveButton = true;
    enableSaveAndSendButton = true;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
    ];

    acceptTypeFile: string[] = ['.doc', '.docx'];
    articleDetailId!: number;
    articleDetailLangId?: number;
    approvedStatus!: any;
    roleApproved: boolean = false;
    lstFlows: any = [];
    artGroupType!: any;
    flowStatus!: any;
    flowStepLast!: any;
    dataContent!: string;
    listTest: any = [];
    contentReplace: string = '';
    listMenu: any = [];
    docB64!: string;
    roleAdmin: boolean = false;
    isView = true;
    isClone = false;
    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ArticleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder,
        private authService: AuthService
    ) {
        this.title = this.dataInput['title'];

        this.portalCode = this.dataInput['portalCode'];
        this.articleDetailId = this.dataInput['articleId'];
        this.articleDetailLangId = this.dataInput['articleDetailLangId'];
        this.langCode = this.dataInput['langCode'];
        this.approvedStatus = this.dataInput['approvedStatus'];
        this.flowStatus = this.dataInput['flowStatus'];
        this.roleAdmin = this.dataInput['roleAdmin'];
        this.isClone = this.dataInput['isClone'] ?? false;
        if (this.articleDetailLangId) {
            this.getDataAttachForDetail(this.articleDetailLangId);
        }
        if (this.articleDetailId) {
            this.getListArticleGroup(this.langCode);
            this.getDataDetail();
        }
        if (this.isClone) {
            this.genArticleCode();
            this.onChangeLang(this.langCode);
            this.approvedStatus = 0;
            this.flowStatus = -1;
        } else {
            this.genArticleCode();
        }
    }

    ngOnInit(): void {
        this.buildForm();
        if (!this.langCode) {
            this.articleForm.controls['langCode'].setValue('VI');
        }
        this.getFlows();
        this.userInfo = this.authService.getUserInfo();
        this.getApproveLast();
        this.getLanguagePortal();
    }

    buildForm() {
        this.articleForm = this.formBuilder.group({
            portalCode: [null, []],
            langCode: [null, [Validators.required]],
            groupCode: [null, [Validators.required]],
            articleCode: [
                { value: null, disabled: true },
                [Validators.required],
            ],
            articleTitle: [null, Validators.maxLength(2000)],
            authorsName: [null, Validators.maxLength(500)],
            authorsInfo: [null, Validators.maxLength(500)],
            describe: [null, Validators.maxLength(4000)],
            priorityLevel: [false, []],
            displayTop: [false, []],
            imgDisplay: [null, []],
            imgDisplayName: [null, []],
            content: [null, []],
            flowCode: [null, [Validators.required]],
            imgDesc: [null, Validators.maxLength(2000)],
            articleSource: [null, Validators.maxLength(300)],
            keyWord: [null, Validators.maxLength(200)],
            publicationTime: [null, []],
            showArticleSource: [false, []],
            menuCode: [null, []],
            articleOrigin: [null, []],
        });

        let disableEditContent =
            (this.approvedStatus === ARTICLE_STATUS.CHO_DUYET &&
                this.flowStatus) ||
            this.approvedStatus === ARTICLE_STATUS.PHE_DUYET ||
            this.approvedStatus === ARTICLE_STATUS.XUAT_BAN;
        if (
            this.roleAdmin === true &&
            this.approvedStatus === ARTICLE_STATUS.XUAT_BAN &&
            !this.isClone
        ) {
            this.enableSaveAndSendButton = false;
            disableEditContent = false;
        } else if (this.isClone) {
            disableEditContent = false;
        }

        if (disableEditContent) {
            this.enableSaveAndSendButton = false;
            this.enableSaveButton = false;
            this.updateViewElement();
            this.isView = false;
        }
    }

    updateViewElement() {
        this.articleForm.controls['portalCode'].disable();
        this.articleForm.controls['langCode'].disable();
        this.articleForm.controls['groupCode'].disable();
        this.articleForm.controls['articleCode'].disable();
        this.articleForm.controls['articleTitle'].disable();
        this.articleForm.controls['authorsName'].disable();
        this.articleForm.controls['authorsInfo'].disable();
        this.articleForm.controls['describe'].disable();
        this.articleForm.controls['priorityLevel'].disable();
        this.articleForm.controls['displayTop'].disable();
        this.articleForm.controls['imgDisplay'].disable();
        this.articleForm.controls['imgDisplayName'].disable();
        this.articleForm.controls['content'].disable();
        this.articleForm.controls['flowCode'].disable();
        this.articleForm.controls['imgDesc'].disable();
        this.articleForm.controls['articleSource'].disable();
        this.articleForm.controls['keyWord'].disable();
        this.articleForm.controls['publicationTime'].disable();
        this.articleForm.controls['showArticleSource'].disable();
        this.articleForm.controls['menuCode'].disable();
        this.articleForm.controls['articleOrigin'].disable();
    }

    getFlows() {
        this.loading = true;
        this.api
            .get(PORTAL_FLOW.FLOW_PORTAL, {
                portalCode: this.portalCode,
            })
            .subscribe({
                next: (res) => {
                    this.lstFlows = res['data'];
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    getLanguagePortal() {
        this.loading = true;
        this.api
            .get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, {
                portalCode: this.portalCode,
            })
            .subscribe({
                next: (res) => {
                    this.lstLangByPortal = res['data'];
                    this.onChangeLang(
                        this.articleForm.controls['langCode'].value
                    );
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    onChangeGroupCode(event: any) {
        let artGroup = _.filter(this.lstArticleGroup, (obj) => {
            return obj['groupCode'] === event['value'];
        });

        if (artGroup && artGroup.length > 0) {
            this.artGroupType = artGroup[0]['groupType'];
            if (this.artGroupType === 1) {
                this.articleForm.controls['articleTitle'].setValidators([
                    Validators.required,
                    Validators.maxLength(2000),
                ]);
                this.articleForm.controls['authorsName'].setValidators([
                    // Validators.required,
                    Validators.maxLength(1000),
                ]);
                this.articleForm.controls['content'].setValidators(
                    Validators.required
                );
            } else {
                this.articleForm.controls['articleTitle'].clearValidators();
                this.articleForm.controls['authorsName'].clearValidators();
                this.articleForm.controls['content'].clearValidators();
            }
            this.articleForm.updateValueAndValidity();
        }
    }

    onChangeLang(item: any) {
        if (item) {
            this.loading = true;
            let param = {
                portalCode: this.portalCode,
                langCode: item.value ? item.value : item,
            };
            this.api
                .post(ARTICLE_GROUP.LIST_MENU_BY_PORTAL_AND_LANG, param)
                .subscribe({
                    next: (res) => {
                        this.listMenu = _.cloneDeep(res['data']);
                        this.listMenu.forEach((obj: any, index: number) => {
                            this.listMenu[index]['name'] = obj.name.replace(
                                /<br>/g,
                                ' '
                            );
                        });
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        }
    }

    getListArticleGroup(item: any) {
        if (item) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.GET_BY_PORTAL, {
                    portalCode: this.portalCode,
                    langCode: item,
                })
                .subscribe({
                    next: (res) => {
                        this.lstArticleGroup = _.cloneDeep(res['data']);
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        }
    }

    onReady(editor: any) {
        // editor.plugins.get('FileRepository').createUploadAdapter = function (
        //     loader: any
        // ) {
        //     return new UploadAdapter(loader);
        // };
        const toolbarElement = editor.ui.view.toolbar.element;

        toolbarElement.style.position = 'sticky';
        toolbarElement.style.top = '-14px';
        toolbarElement.style.zIndex = '100';
        editor.plugins.get('FileRepository').createUploadAdapter = (
            loader: any
        ) => {
            return new Adapter(loader, editor.config);
        };

        if (editor.model.schema.isRegistered('image')) {
            editor.model.schema.extend('image', {
                allowAttributes: 'blockIndent',
            });
        }

        editor.ui
            .getEditableElement()
            .parentElement.insertBefore(
                editor.ui.view.toolbar.element,
                editor.ui.getEditableElement()
            );
    }

    config = {
        toolbar: {
            items: [
                'heading',
                '|',
                'fontfamily',
                'fontsize',
                'alignment',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'bold',
                'italic',
                'strikethrough',
                'underline',
                'subscript',
                'superscript',
                '|',
                'link',
                '|',
                'outdent',
                'indent',
                '|',
                'bulletedList',
                '-',
                'numberedList',
                'todoList',
                '|',
                'code',
                'codeBlock',
                '|',
                'insertTable',
                '|',
                'imageUpload',
                'blockQuote',
                '|',
                'todoList',
                'undo',
                'redo',
            ],
            shouldNotGroupWhenFull: true,
        },
        fontSize: {
            options: [9, 11, 13, 15, 17, 19, 21],
        },
        image: {
            // Configure the available styles.
            styles: ['alignLeft', 'alignCenter', 'alignRight'],

            // Configure the available image resize options.
            resizeOptions: [
                {
                    name: 'resizeImage:original',
                    label: 'Original',
                    value: null,
                },
                {
                    name: 'resizeImage:50',
                    label: '25%',
                    value: '25',
                },
                {
                    name: 'resizeImage:50',
                    label: '50%',
                    value: '50',
                },
                {
                    name: 'resizeImage:75',
                    label: '75%',
                    value: '75',
                },
            ],

            // You need to configure the image toolbar, too, so it shows the new style
            // buttons as well as the resize buttons.
            toolbar: [
                'imageStyle:alignLeft',
                'imageStyle:alignCenter',
                'imageStyle:alignRight',
                '|',
                'ImageResize',
                '|',
                'imageTextAlternative',
            ],
        },
        // simpleUpload: {
        //    The URL that the images are uploaded to.
        // uploadUrl: 'http://localhost:52536/api/Image/ImageUpload',

        //   Enable the XMLHttpRequest.withCredentials property.

        //},

        language: 'en',
    };

    doClose(): any {
        this.dialogRef.close();
    }

    // changeFile(event: any) {
    //
    //     if (event && event[0]) {
    //         if (!_.includes(this.acceptTypeImage, event[0].type)) {
    //             this.toast.showWarning(
    //                 'Chỉ được upload file có định dạng ảnh!'
    //             );
    //             return;
    //         } else {
    //             this.articleForm.controls['imgDisplayName'].setValue(
    //                 event[0]['name']
    //             );
    //             this.imgDisplayName = event[0]['name'];
    //             let fileUtils = new FileUtils();
    //             fileUtils.convertFileToBase64(event[0]).subscribe((base64) => {
    //                 this.imgDisplay = base64;
    //             });
    //         }
    //     }
    // }

    changeFileOriginImport(event: any) {
        if (event && event[0]) {
            var n =
                event[0].name.lastIndexOf('doc') ||
                event[0].name.lastIndexOf('docx');
            if (n != -1) {
                this.fileWordOrigin = event[0];
                let fileUtils = new FileUtils();
                fileUtils.convertFileToBase64(event[0]).subscribe((base64) => {
                    this.docB64 = base64;
                });
            } else {
                this.toast.showWarning(
                    'Chỉ được upload file có định dạng .doc, .docx!'
                );
                return;
            }
        }
    }

    changeFileImport(event: any) {
        if (event && event[0]) {
            var n =
                event[0].name.lastIndexOf('doc') ||
                event[0].name.lastIndexOf('docx');
            if (n != -1) {
                this.loading = true;
                let data = new FormData();
                data.append('file', event[0]);

                this.api.uploadFile(UTILS.WORD_TO_HTML, data).subscribe(
                    (res) => {
                        this.articleForm.controls['content'].setValue(
                            res['data']
                        );
                        this.loading = false;
                        (
                            this.fileWordImport
                                .nativeElement as HTMLInputElement
                        ).value = '';
                    },
                    () => {
                        this.loading = false;
                        (
                            this.fileWordImport
                                .nativeElement as HTMLInputElement
                        ).value = '';
                    }
                );
            } else {
                this.toast.showWarning(
                    'Chỉ được upload file có định dạng .doc, .docx!'
                );
                return;
            }
        }
    }

    doPreview(item: any) {
        let params: object = {
            title: '',
            imgName: item.imgDisplayName,
            fileContent: item.imgDisplay,
            description: item.imgDesc,
        };

        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: params,
            disableClose: true,
        });
    }

    genArticleCode() {
        this.loading = true;
        this.api.get(ARTICLE_DETAIL.GEN_CODE).subscribe({
            next: (res) => {
                this.loading = false;
                this.articleForm.controls['articleCode'].setValue(res['data']);
            },
            error: () => {
                this.loading = false;
            },
        });
    }

    doSave(typeSave: number) {
        if (this.articleForm.invalid) {
            this.articleForm.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }

        //call save
        this.loading = true;
        let paramBody = this.articleForm.value;

        paramBody['lstAttach'] = this.lstImgUpload;
        paramBody['portalCode'] = this.portalCode;
        paramBody['imgDisplay'] = this.imgDisplay;
        paramBody['typeSave'] = typeSave;
        paramBody['articleCode'] =
            this.articleForm.controls['articleCode'].value;
        if (this.articleDetailId && this.articleDetailLangId && !this.isClone) {
            paramBody['articleDetailId'] = this.articleDetailId;
            paramBody['articleDetailLangId'] = this.articleDetailLangId;
        }

        if (
            !this.flowStepFirst ||
            (this.flowStepFirst && this.flowStepCurrent === null) ||
            (this.flowStepFirst && this.flowStepCurrent === -1) ||
            this.isClone
        ) {
            this.api.post(ARTICLE_DETAIL.SAVE_UPDATE, paramBody).subscribe({
                next: (res) => {
                    this.loading = false;
                    if (res['data'] === true) {
                        if (typeSave == 0) {
                            this.toast.showSuccess(
                                'Thông báo',
                                'Lưu dữ liệu thành công'
                            );
                        } else {
                            this.toast.showSuccess(
                                'Thông báo',
                                'Lưu và gửi dữ liệu thành công'
                            );
                        }
                        this.doClose();
                    } else {
                        this.toast.showWarning(
                            'Thông báo',
                            'Lưu dữ liệu không thành công. Vui lòng thực hiện lại.'
                        );
                    }
                },
                error: () => {
                    this.loading = false;
                },
            });
        } else {
            this.api
                .post(ARTICLE_DETAIL.SAVE_UPDATE_BY_USER_APPROVE, paramBody)
                .subscribe({
                    next: (res) => {
                        this.loading = false;
                        if (res['data'] === true) {
                            if (typeSave == 0) {
                                this.toast.showSuccess(
                                    'Thông báo',
                                    'Lưu dữ liệu thành công'
                                );
                            } else {
                                this.toast.showSuccess(
                                    'Thông báo',
                                    'Lưu và gửi dữ liệu thành công'
                                );
                            }
                            this.doClose();
                        } else {
                            this.toast.showWarning(
                                'Thông báo',
                                'Lưu dữ liệu không thành công. Vui lòng thực hiện lại.'
                            );
                        }
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        }
    }

    getDataDetail() {
        this.loading = true;
        this.api
            .get(ARTICLE_DETAIL.DETAIL, {
                langCode: this.langCode,
                articleDetailId: this.articleDetailId,
            })
            .subscribe({
                next: (res) => {
                    if (res['data']) {
                        this.defaultValue(res['data']);
                    } else {
                        this.loading = false;
                    }
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    defaultValue(data: any) {
        this.articleForm.controls['portalCode'].setValue(this.portalCode);
        this.articleForm.controls['langCode'].setValue(this.langCode);
        this.articleForm.controls['groupCode'].setValue(data['groupCode']);
        if (!this.isClone) {
            this.articleForm.controls['articleCode'].setValue(
                data['articleCode']
            );
            this.flowStepCurrent = data['flowStepCurrent'];
        }
        this.articleForm.controls['articleTitle'].setValue(
            data['articleTitle']
        );
        this.articleForm.controls['authorsName'].setValue(data['authorsName']);
        this.articleForm.controls['authorsInfo'].setValue(data['authorsInfo']);
        this.articleForm.controls['describe'].setValue(data['describe']);
        this.articleForm.controls['priorityLevel'].setValue(
            data['priorityLevel']
        );
        this.articleForm.controls['displayTop'].setValue(data['displayTop']);
        this.articleForm.controls['showArticleSource'].setValue(
            data['showArticleSource']
        );
        this.articleForm.controls['content'].setValue(data['content']);
        this.articleForm.controls['flowCode'].setValue(data['flowCode']);
        this.articleForm.controls['imgDesc'].setValue(data['imgDesc']);
        this.articleForm.controls['articleSource'].setValue(
            data['articleSource']
        );
        this.articleForm.controls['menuCode'].setValue(data['menuCode']);
        this.articleForm.controls['keyWord'].setValue(data['keyWord']);
        this.articleForm.controls['publicationTime'].setValue(
            data['publicationTime']
        );
        this.articleDetailLangId = data['articleDetailLangId'];

        this.artGroupType = data['typeGroup'];
        this.loading = false;
    }

    getDataAttachForDetail(articleDetailLangId: number) {
        this.loading = true;
        this.api
            .get(ARTICLE_DETAIL.GET_ATTACH, {
                articleDetailLangId: articleDetailLangId,
            })
            .subscribe({
                next: (res) => {
                    if (res['data']) {
                        this.lstImgUpload = res['data'];
                    }
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    removeImgAttach(index: any) {
        this.lstImgUpload.splice(index, 1);
        this.fileField.nativeElement.value = '';
    }

    getApproveLast() {
        if (this.articleDetailLangId) {
            this.api
                .get(ARTICLE_DETAIL.GET_LIST_FLOW_STEP, {
                    articleDetailLangId: this.articleDetailLangId,
                })
                .subscribe((res) => {
                    if (res['data']) {
                        this.lstFlowStep = res['data'];
                        this.flowStepFirst = this.lstFlowStep[0];
                        this.lstNameFlowStep = _.map(res['data'], 'userName');
                        this.flowStepLast =
                            this.lstNameFlowStep[
                                this.lstNameFlowStep.length - 1
                            ];
                        if (this.flowStepLast == this.userInfo['userName']) {
                            this.checkApproveLast = true;
                        } else {
                            this.checkApproveLast = false;
                        }
                    }
                });
        }
    }

    onChangeMenuCode(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.LIST_ACTICLE_GROUP_SUB, {
                    portalCode: this.portalCode,
                    langCode: this.articleForm.controls['langCode'].value,
                    menuCode: value,
                })
                .subscribe({
                    next: (res) => {
                        this.lstArticleGroup = res['data'];
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        }
    }

    doUploadDialog(type: string) {
        let param: object = {
            title: 'Upload hình ảnh',
            lstImgUpload: type === 'ava' ? _.cloneDeep(this.lstImgUpload) : [],
            lstImgBefore: type === 'btn' ? _.cloneDeep(this.lstImgUpload) : [],
            isView: type !== 'ava',
        };
        const dialogRef = this.dialog.open(UploadImagesDialogComponent, {
            width: '50%',
            data: param,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((res) => {
            if (res && res['rs'] == true) {
                if (res['type'] === 'upload') {
                    this.lstImgUpload = _.union(
                        this.lstImgUpload,
                        res['lstImgUpload']
                    );
                } else {
                    this.lstImgUpload = res['lstImgUpload'];
                }
            }
        });
    }

    doViewFile() {
        let param: object = {
            title: 'Upload file gốc',
            doc: this.docB64,
        };
        this.dialog.open(PreviewWordComponent, {
            width: '50%',
            data: param,
        });
    }

    removeFileOrg() {
        this.fileWordOrigin = null;
    }

    doAttach() {
        let param: object = {
            title: 'Tệp tin đính kèm',
            articleDetailLangId: this.articleDetailLangId,
            articleImgs: _.cloneDeep(this.lstImgUpload),
            wordContent: this.articleForm.controls['content'].value,
        };
        const dialogRef = this.dialog.open(ArticleAttachComponent, {
            width: '50%',
            data: param,
        });
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                res['articleContent']
                    ? this.articleForm.controls['content'].setValue(
                          res['articleContent']
                      )
                    : this.articleForm.controls['content'].setValue(null);
                this.articleForm.controls['articleOrigin'].setValue(
                    res['articleOriginContent']
                );
                this.lstImgUpload = res['articleImgs'];
            }
        });
    }
}
