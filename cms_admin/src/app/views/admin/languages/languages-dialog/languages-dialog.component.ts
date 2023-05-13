import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { LANGUAGE_ENDPOINT } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { FileUtils } from './../../../../common/utils/file-utils';
import * as _ from 'lodash';
import { REGEX_PATERN } from '../../../../common/enum/ERegexPatern';

@Component({
    selector: 'app-languages-dialog',
    templateUrl: './languages-dialog.component.html',
    styleUrls: ['./languages-dialog.component.scss'],
})
export class LanguagesDialogComponent implements OnInit {
    @ViewChild('fileField') fileField: any;
    loading: boolean = false;
    title!: string;
    langForm!: FormGroup;
    langId!: number;
    langIconName!: string;
    langIconContent!: any;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
    ];

    constructor(
        private dialogRef: MatDialogRef<LanguagesDialogComponent>,
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
            langName: ['', [Validators.required, Validators.maxLength(70)]],
            langIcon: [''],
        });
    }

    getDataDetail() {
        this.loading = true;
        this.api
            .get(LANGUAGE_ENDPOINT.GET_DATA_DETAIL + '/' + this.langId)
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
        if (!this.langIconContent) {
            this.toast.showWarning('Thông báo', 'Upload ảnh ngôn ngữ');
            return;
        }

        this.loading = true;
        // let dataSave = this.langForm.value;
        let param: any = {
            code: this.langForm['controls']['langCode'].value.toUpperCase(),
            name: this.langForm['controls']['langName'].value,
            icon: this.langIconContent,
            fileName: this.langIconName,
        };

        if (this.langId) {
            param['id'] = this.langId;
        }

        this.api.post(LANGUAGE_ENDPOINT.SAVE_OR_UPDATE, param).subscribe({
            next: (res) => {
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
                        'Mã ngôn ngữ đã tồn tại, kiểm tra lại thông tin đầu vào.'
                    );
                }
            },
            error: (error) => {
                this.loading = false;
            },
        });
    }

    changeFile(event: any) {
        if (event && event[0]) {
            if (!_.includes(this.acceptTypeImage, event[0].type)) {
                this.toast.showWarning(
                    'Chỉ được upload file có định dạng ảnh!'
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
    }

    defaultDataDetail(langData: any) {
        this.langForm['controls']['langCode'].setValue(langData.code);
        this.langForm['controls']['langName'].setValue(langData.name);
        this.langIconContent = langData['icon'];
        this.langIconName = langData.fileName;

        this.langForm['controls']['langCode'].disable();
    }

    doClose(): void {
        this.dialogRef.close();
    }
}
