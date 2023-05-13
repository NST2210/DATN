import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ARTICLE_DETAIL, ARTICLE_GROUP, LANGUAGE_ENDPOINT, UTILS, VIDEOS} from 'src/app/common/enum/EApiUrl';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {ArticleDialogComponent} from 'src/app/views/article-detail-info/article-dialog/article-dialog.component';

@Component({
    selector: 'app-videos-dialog',
    templateUrl: './videos-dialog.component.html',
    styleUrls: ['./videos-dialog.component.scss']
})
export class VideosDialogComponent implements OnInit {

    loading: boolean = false;

    title!: string;
    Editor = null;
    content!: string;

    portalCode!: string;
    lstLangByPortal: any = [];
    lstArticleGroup: any = [];

    videosLangForm!: FormGroup;
    articleForm!: FormGroup;
    videosDisplay!: any;
    imgDisplayName!: string;
    articleDetailId!: number;
    articleDetailLangId!: number;
    langCode!: string;
    videosLangId!: number;
    roleApproved: boolean = false;

    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ArticleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {
        this.title = this.dataInput['title'];
        this.portalCode = this.dataInput['portalCode'];
        this.articleDetailId = this.dataInput['articleId'];
        this.langCode = this.dataInput['langCode'];
        if (this.articleDetailId) {
            this.getDataDetail();
        }

    }

    ngOnInit(): void {
        this.buildForm();
        this.getLanguagePortal();

    }

    buildForm() {
        this.videosLangForm = this.formBuilder.group({
            portalCode: [null, []],
            langCode: [null, [Validators.required]],
            describe: [null, [Validators.required]],
            content: [null, [Validators.required]],
        });

        this.videosLangForm.controls['langCode'].valueChanges.subscribe(
            (change) => {
                this.onChangeLang(change);
            }
        );
    }

    url: any;
    format: any;

    onSelectFile(event: any) {
        const file = event.target.files && event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            if (file.type.indexOf('image') > -1) {
                this.format = 'image';
            } else if (file.type.indexOf('video') > -1) {
                this.format = 'video';
            }
            reader.onload = (event) => {
                this.url = (<FileReader>event.target).result;
            }
        }
        const formData = new FormData();
        formData.append('url', this.url);

    }


    getLanguagePortal() {
        this.loading = true;
        this.api
            .get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, {
                portalCode: this.portalCode,
            })
            .subscribe(
                (res) => {
                    this.lstLangByPortal = res['data'];
                    this.loading = false;
                },
                (error) => {
                    this.loading = false;
                }
            );
    }

    onChangeLang(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.GET_BY_PORTAL, {
                    portalCode: this.portalCode,
                    langCode: value,
                })
                .subscribe(
                    (res) => {
                        this.lstArticleGroup = res['data'];
                        this.loading = false;
                    },
                    () => {
                        this.loading = false;
                    }
                );
        }
    }

    onReady(editor: any) {
        editor.ui
            .getEditableElement()
            .parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    doClose(): any {
        this.dialogRef.close();
    }

    changeFileImport(event: any) {
        if (event && event[0]) {
            this.loading = true;
            let data = new FormData();
            data.append('file', event[0]);

            this.api.uploadFile(UTILS.WORD_TO_HTML, data).subscribe(
                (res) => {
                    this.articleForm.controls['content'].setValue(res['data']);
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
        }
    }


    doSave(typeSave: number) {
        if (this.videosLangForm.invalid) {
            this.videosLangForm.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }

        //call save
        this.loading = true;
        let paramBody = this.videosLangForm.value;

        paramBody['portalCode'] = this.portalCode;
        paramBody['videosDisplay'] = this.videosDisplay;
        paramBody['typeSave'] = typeSave;

        if (this.videosLangId) {
            paramBody['videosLangId'] = this.videosLangId;
        }

        this.api.post(VIDEOS.SAVE_OR_UPDATE, paramBody).subscribe(
            (res) => {
                this.loading = false;
                if (res['data'] === true) {
                    this.toast.showSuccess(
                        'Thông báo',
                        'Lưu dữ liệu thành công'
                    );
                    this.doClose();
                } else {
                    this.toast.showWarning(
                        'Thông báo',
                        'Lưu dữ liệu không thành công. Vui lòng thực hiện lại.'
                    );
                }
            },
            () => {
                this.loading = false;
            }
        );
    }

    getDataDetail() {
        this.loading = true;
        this.api
            .get(ARTICLE_DETAIL.DETAIL, {
                langCode: this.langCode,
                articleDetailId: this.articleDetailId,
            })
            .subscribe(
                (res) => {
                    if (res['data']) {
                        this.defaultValue(res['data']);
                    } else {
                        this.loading = false;
                    }
                },
                () => {
                    this.loading = false;
                }
            );
    }

    defaultValue(data: any) {
        this.articleForm.controls['portalCode'].setValue(this.portalCode);
        this.articleForm.controls['langCode'].setValue(this.langCode);
        this.articleForm.controls['groupCode'].setValue(data['groupCode']);
        this.articleForm.controls['articleCode'].setValue(data['articleCode']);
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
        this.articleForm.controls['imgDisplay'].setValue(data['imgDisplay']);
        this.articleForm.controls['imgDisplayName'].setValue(
            data['imgDisplayName']
        );
        this.articleForm.controls['content'].setValue(data['content']);

        this.imgDisplayName = data['imgDisplayName'];
        this.articleDetailLangId = data['articleDetailLangId'];
        this.loading = false;
    }
}
