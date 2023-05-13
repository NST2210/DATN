import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, } from '@angular/material/dialog';
import { ARTICLE_DETAIL } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';

@Component({
    selector: 'app-article-approve-or-reject',
    templateUrl: './article-approve-or-reject.component.html',
    styleUrls: ['./article-approve-or-reject.component.scss'],
})
export class ArticleApproveOrRejectComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    isReject: boolean = false;
    articleDetailLangId!: number;
    rejectForm!: FormGroup;

    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ArticleApproveOrRejectComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        this.articleDetailLangId = this.dataInput['articleDetailLangId'];
        this.buildForm();
    }

    buildForm() {
        this.rejectForm = this.formBuilder.group({
            actionType: ['1', [Validators.required]],
            rejectContent: [null, [Validators.maxLength(2000)]],
        });

        this.rejectForm.controls['actionType'].valueChanges.subscribe(
            () => {
                this.isReject = !this.isReject;
                if (this.isReject === true) {
                    this.rejectForm['controls']['rejectContent'].setValidators(
                        [Validators.required,Validators.maxLength(2000)]
                    );
                } else {
                    this.rejectForm['controls']['rejectContent'].setValidators(
                        []
                    );
                }
                this.rejectForm['controls'][
                    'rejectContent'
                ].updateValueAndValidity();
            }
        );
    }

    doConfirm() {
        if (this.rejectForm.invalid) {
            this.rejectForm.markAllAsTouched();
            this.toast.showWarning('Thông báo', 'Vui lòng nhập lại dữ liệu !');
            return;
        }

        //call save
        this.loading = true;

        let type = 1;
        let rejectContent = '';
        if (this.rejectForm['controls']['actionType'].value === '2') {
            type = 0;
            rejectContent = this.rejectForm['controls']['rejectContent'].value;
        }
        this.api.post(ARTICLE_DETAIL.APPROVE_REJECT, null, {
            articleDetailId: this.articleDetailLangId,
            typeApprove: type,
            rejectContent: rejectContent,
        }).subscribe((res) => {
            if (res) {
                let msg =
                    type === 0
                        ? 'Từ chối duyệt bài viết thành công'
                        : 'Duyệt bài viết thành công';

                this.toast.showSuccess('Thông báo', msg);
                this.doClose();
            } else {
                let msg =
                    type === 0
                        ? 'Từ chối duyệt bài viết không thành công'
                        : 'Duyệt bài viết không thành công';
                this.toast.showWarning('Thông báo', msg);
            }
            this.loading = false;
        },
            () => {
                this.loading = false;
            }
        );
    }

    doClose(): any {
        this.dialogRef.close();
    }
}
