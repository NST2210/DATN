import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { PORTAL_INTRODUCE } from 'src/app/common/enum/EApiUrl';
import { REGEX_PATERN } from 'src/app/common/enum/ERegexPatern';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { FileUtils } from 'src/app/common/utils/file-utils';
import * as _ from 'lodash';
import { ImagePreviewComponent } from 'src/app/common/GUI/image-preview/image-preview.component';

@Component({
    selector: 'app-portal-introduce-dialog',
    templateUrl: './portal-introduce-dialog.component.html',
    styleUrls: ['./portal-introduce-dialog.component.scss'],
})
export class PortalIntroduceDialogComponent implements OnInit {
    @ViewChild('fileField') fileField: any;
    loading: boolean = false;
    title!: string;
    form!: FormGroup;
    langId!: number;
    displayImgName!: string;
    displayImgContent!: any;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
    ];
    describe!: string;
    portalCode!: string;
    lstLangByPortal: any = [];

    constructor(
        private dialogRef: MatDialogRef<PortalIntroduceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        public dialog: MatDialog,
        private formBuilder: FormBuilder,
        private toast: ToastNotiService
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.title = this.dataInput['title'];
        this.portalCode = this.dataInput['portalCode'];
        this.lstLangByPortal = this.dataInput['lstLangByPortal'];
        if (this.dataInput['langId']) {
            this.langId = this.dataInput['langId'];
            this.getDataDetail();
        }
    }

    buildForm() {
        this.form = this.formBuilder.group({
            code: [
                '',
                [
                    Validators.required,
                    Validators.pattern(REGEX_PATERN.LANGUAGES),
                    Validators.maxLength(30),
                ],
            ],
            title: ['', [Validators.required, Validators.maxLength(70)]],
            langCode: ['', [Validators.required]],
        });
    }

    getDataDetail() {
        this.loading = true;
        this.api
            .get(PORTAL_INTRODUCE.GET_DATA_DETAIL + '/' + this.langId)
            .subscribe((res) => {
                this.defaultDataDetail(res['data']);
                this.loading = false;
            });
    }

    doUploadDialog() {
        let param: object = {
            imgName: this.displayImgName,
            loading: false,
            fileContent: this.displayImgContent,
        };
        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: param,
            disableClose: true,
        });
    }

    doSave() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.showWarning('Thông báo', 'Kiểm tra dữ liệu đầu vào');
            return;
        }

        if (!this.displayImgContent) {
            this.toast.showWarning('Thông báo', 'Hãy thêm ảnh');
            return;
        }

        this.loading = true;
        let param: any = {
            code: this.form['controls']['code'].value.toUpperCase(),
            title: this.form['controls']['title'].value,
            imgDisplay: this.displayImgContent,
            imgDisplayName: this.displayImgName,
            langCode: this.form['controls']['langCode'].value,
            portalCode: this.portalCode,
        };

        if (this.langId) {
            param['id'] = this.langId;
        }

        this.api.post(PORTAL_INTRODUCE.SAVE_OR_UPDATE, param).subscribe(
            (res) => {
                this.loading = false;
                if (res.data === 0) {
                    let msg = param['id']
                        ? 'Cập nhật dữ liệu thành công'
                        : 'Thêm mới dữ liệu thành công';

                    this.toast.showSuccess('Thông báo', msg);
                    this.doClose();
                } else {
                    this.toast.showInfo(
                        'Thông báo',
                        'Mã intro đã tồn tại, kiểm tra lại thông tin đầu vào.'
                    );
                }
            },
            (error) => {
                this.loading = false;
            }
        );
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

    removeFile() {
        this.displayImgName = '';
        this.displayImgContent = '';
        this.fileField.nativeElement.value = '';
    }

    defaultDataDetail(langData: any) {
        if (!this.form) this.buildForm();
        this.form['controls']['title'].setValue(langData.title);
        this.form['controls']['code'].setValue(langData.code);
        this.form['controls']['langCode'].setValue(langData.langCode);
        this.portalCode = langData.portalCode;
        this.displayImgContent = langData['imgDisplay'];
        this.displayImgName = langData['imgDisplayName'];
        this.form['controls']['code'].disable();
        this.form['controls']['langCode'].disable();
    }

    doClose(): void {
        this.dialogRef.close();
    }
}
