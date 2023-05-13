import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LINKED } from 'src/app/common/enum/EApiUrl';
import { REGEX_PATERN } from 'src/app/common/enum/ERegexPatern';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { FileUtils } from 'src/app/common/utils/file-utils';
import * as _ from 'lodash';

@Component({
    selector: 'app-partner-dialog',
    templateUrl: './partner-dialog.component.html',
    styleUrls: ['./partner-dialog.component.scss'],
})
export class PartnerDialogComponent implements OnInit {
    @ViewChild('fileField') fileField: any;
    loading: boolean = false;
    title!: string;
    langForm!: FormGroup;
    langId!: number;
    langIconName!: string;
    langIconContent!: any;
    portalCode = 'VDSS';
    isShowUploadButton: boolean = true;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
    ];

    constructor(
        private dialogRef: MatDialogRef<PartnerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        public dialog: MatDialog,
        private formBuilder: FormBuilder,
        private toast: ToastNotiService
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.title = this.dataInput['title'];
        if (this.dataInput['langId']) {
            this.langId = this.dataInput['langId'];
            this.getDataDetail();
        }
    }

    buildForm() {
        this.langForm = this.formBuilder.group({
            langCode: [
                '',
                [
                    Validators.required,
                    Validators.pattern(REGEX_PATERN.LANGUAGES),
                    Validators.maxLength(30),
                ],
            ],
            title: ['', [Validators.required, Validators.maxLength(70)]],
            logo: this.langIconContent,
            link: ['', [Validators.required]],
        });
    }

    getDataDetail() {
        this.loading = true;
        this.api
            .get(LINKED.GET_DATA_DETAIL + '/' + this.langId)
            .subscribe((res) => {
                this.defaultDataDetail(res['data']);
                this.loading = false;
            });
    }

    doSave() {
        if (this.langForm.invalid) {
            this.langForm.markAllAsTouched();
            this.toast.showWarning('Thông báo', 'Kiểm tra dữ liệu đầu vào');
            return;
        }

        this.loading = true;
        // let dataSave = this.langForm.value;
        let param: any = {
            langCode: this.langForm['controls']['langCode'].value.toUpperCase(),
            title: this.langForm['controls']['title'].value,
            fileName: this.langIconName,
            logo: this.langIconContent,
            link: this.langForm['controls']['link'].value,
            portalCode: this.portalCode,
        };

        if (this.langId) {
            param['id'] = this.langId;
        }

        this.api.post(LINKED.SAVE_OR_UPDATE, param).subscribe(
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
                        'Mã đối tác đã tồn tại, kiểm tra lại thông tin đầu vào.'
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
                    'Chỉ được upload file có định dạng ảnh.'
                );
                return;
            } else {
                this.langIconName = event[0].name;
                let fileUtils = new FileUtils();
                fileUtils.convertFileToBase64(event[0]).subscribe((base64) => {
                    this.langIconContent = base64;
                });
            }
        }
    }

    removeFile() {
        this.langIconName = '';
        this.langIconContent = '';
        this.fileField.nativeElement.value = '';
        this.isShowUploadButton = true;
    }

    defaultDataDetail(langData: any) {
        this.langForm['controls']['langCode'].setValue(langData.langCode);
        this.langForm['controls']['title'].setValue(langData.title);
        this.langForm['controls']['link'].setValue(langData.link);
        this.langIconContent = langData['logo'];
        this.langIconName = langData.fileName;
        this.langForm['controls']['langCode'].disable();
    }

    doClose(): void {
        this.dialogRef.close();
    }
}
