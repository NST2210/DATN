import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PORTAL_INFO_ENDPOINT} from 'src/app/common/enum/EApiUrl';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {REGEX_PATERN} from "../../../../common/enum/ERegexPatern";

@Component({
    selector: 'app-portal-dialog',
    templateUrl: './portal-dialog.component.html',
    styleUrls: ['./portal-dialog.component.scss'],
})
export class PortalDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;

    portalForm!: FormGroup;
    portalId!: number;

    constructor(
        private dialogRef: MatDialogRef<PortalDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        public dialog: MatDialog,
        private formBuilder: FormBuilder,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        if (this.dataInput['id']) {
            this.portalId = this.dataInput['id'];
            this.getDataDetail();
        }
        this.buildForm();
    }

    buildForm() {
        this.portalForm = this.formBuilder.group({
            code: ['', [Validators.required, Validators.pattern(REGEX_PATERN.PORTAL_CODE), Validators.maxLength(30)]],
            urlPath: ['', [Validators.required, Validators.maxLength(200)]],
            description: ['', [Validators.required, Validators.maxLength(70)]],
        });
    }

    doSave() {
        if (this.portalForm.invalid) {
            this.portalForm.markAllAsTouched();
            this.toast.showWarning(
                'Cảnh báo',
                'Kiểm tra lại thông tin đầu vào'
            );
            return;
        }
        this.loading = true;
        let dataSave = this.portalForm.getRawValue();

        if (this.portalId) {
            dataSave['id'] = this.portalId;
        }
        dataSave['code'] = dataSave['code'].toUpperCase();
        this.api.post(PORTAL_INFO_ENDPOINT.SAVE_OR_UPDATE, dataSave).subscribe(
            (res) => {
                this.loading = false;
                if (res.data === 0) {
                    let msg = 'Thêm mới dữ liệu thành công';
                    if (this.portalId) {
                        msg = 'Cập nhật dữ liệu thành công';
                    }
                    this.toast.showSuccess('Thông báo', msg);
                    this.doClose();
                } else {
                    this.toast.showInfo(
                        'Thông báo',
                        'Mã Portal đã tồn tại, kiểm tra lại thông tin đầu vào.'
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
            .get(PORTAL_INFO_ENDPOINT.GET_DATA_DETAIL + '/' + this.portalId)
            .subscribe(
                (res) => {
                    this.defaultDataDetail(res['data']);
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
    }

    defaultDataDetail(dataDetail: any) {
        this.portalForm['controls']['code'].setValue(dataDetail.code);
        this.portalForm['controls']['urlPath'].setValue(dataDetail.urlPath);
        this.portalForm['controls']['description'].setValue(
            dataDetail.description
        );

        this.portalForm['controls']['code'].disable();
    }

    doClose(): void {
        this.dialogRef.close();
    }
}
