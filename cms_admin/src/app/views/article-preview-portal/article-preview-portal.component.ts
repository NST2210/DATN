import { ArticleViewDetailModel } from './../../common/model/ArticleViewDetailModel';
import { Component, Inject, OnInit } from '@angular/core';
import { HelperService } from 'src/app/common/services/helper/helper.service';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import {
    ARTICLE_DETAIL,
    ARTICLE_DETAIL_LANG,
} from 'src/app/common/enum/EApiUrl';
import { AuthService } from 'src/app/common/services/auth/auth.service';
import { ERole } from 'src/app/common/enum/ERole';
import * as _ from 'lodash';
import { DialogCommonComponent } from '../../common/GUI/dialog-common/dialog-common.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DateTimeUtilsService } from 'src/app/common/services/datetime/date-time-utils.service';

@Component({
    selector: 'app-article-preview-portal',
    templateUrl: './article-preview-portal.component.html',
    styleUrls: ['./article-preview-portal.component.scss'],
})
export class ArticlePreviewPortalComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    roleApproved: boolean = false;

    articleDetail: ArticleViewDetailModel = new ArticleViewDetailModel();
    articleDetailId!: number;
    isView: boolean = false;
    lstKeyWord: any = [];

    contentReplace!: SafeHtml;
    feedbackData: any = [];
    articleDetailLangId!: number;
    showArticleSource!: boolean;
    articleSource!: string;

    constructor(
        public helper: HelperService,
        private dialogRef: MatDialogRef<ArticlePreviewPortalComponent>,
        public dateTimeUtils: DateTimeUtilsService,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private auth: AuthService,
        private dialog: MatDialog,
        private _sanitizer: DomSanitizer
    ) {
        let userInfo = this.auth.getUserInfo();
        if (userInfo) {
            this.roleApproved = _.includes(
                userInfo['authorities'],
                ERole.APROVE
            );
        }
    }

    ngOnInit(): void {
        this.title = this.dataInput['title'];
        let portalCode = this.dataInput['portalCode'];
        this.articleDetailId = this.dataInput['articleId'];
        this.articleDetailLangId = this.dataInput['articleDetailLangId'];
        let langCode = this.dataInput['langCode'];
        this.isView = this.dataInput['isView'];
        if (this.articleDetailId && portalCode && langCode) {
            this.getDataDetail(langCode, this.articleDetailId);
        }
        if (this.articleDetailLangId) {
            this.getDataFeedbackDetail(this.articleDetailLangId);
        }
    }

    getDataDetail(langCode: string, articleDetailId: number) {
        this.loading = true;
        this.api.get(ARTICLE_DETAIL.DETAIL, {
            langCode: langCode,
            articleDetailId: articleDetailId,
        }).subscribe((res) => {
            if (res['data']) {
                this.articleDetail = res['data'];
                this.showArticleSource = res['data']['showArticleSource'];
                this.articleSource = res['data']['articleSource'];
                if (res['data']['content']) {
                    let rsContent = res['data']['content'];
                    rsContent = rsContent
                        .replace(/<s>(.*?)<\/s>/g, '')
                        .replace(/<del.*?>(.*?)<\/del>/g, '')
                        .replace(/<ins.*?>/g, '<ins>')
                        .replace(/<span style=".*?text-decoration:line-through.*?>(.*?)<\/span>/g, '')
                        .replace(/<figure.*?>/g, '<figure style ="display: block;">')
                        .replace(/<img/g, '<img style ="object-fit: contain; margin: auto; display: block; min-width: 50%; text-align: center; max-width: 100%;height: auto;border-radius: 10px;" data-bs-toggle="modal" *ngIf="arr && arr.length > 0"data-bs-target="#staticBackdrop2""')
                        .replace(/<div[^>]*style="-aw-headerfooter-type:header-primary; clear:both"[^>]*>(.*?)<\/div>/gs, '')
                        .replace(/<div[^>]*style="-aw-headerfooter-type:footer-primary; clear:both"[^>]*>(.*?)<\/div>/gs, '')
                        .replace(/<ins\b/gi, '<span')
                        .replace(/<\/ins>/gi, '</span>')
                        .replace(/  +/g, ' ')
                        .replace(/(?=]).*?([.])/g,']</sup>')
                        .replace(/(?=href).*?[[]/g,'href="#1" id="1" style="text-decoration: none;" ><sup>')
                        .replace(/<table/g, '<table style="width:100%"')
                        .replace(/<tr><td>/g, '')
                        .replace(/<h1 style=\"margin-top:0pt; margin-bottom:0pt; text-indent:36pt;/g, '<h1 style=\"margin-top:0pt; margin-bottom:0pt;text-indent:0pt;font-weight: bold; ')
                        .replace(/<p style=\"margin-top:0pt; margin-bottom:0pt; text-indent:36pt;/g, '<p style=\"margin-top:0pt; margin-bottom:0pt;text-indent:0pt; ');
                    this.contentReplace =
                        this._sanitizer.bypassSecurityTrustHtml(
                            rsContent
                        );
                }
                if (res['data']['keyWord']) {
                    this.lstKeyWord = res['data']['keyWord'].split(';');
                }
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

    doApproveOrReject(type: number) {
        this.loading = true;
        this.api
            .post(ARTICLE_DETAIL.APPROVE_REJECT, null, {
                articleDetailId: this.articleDetailId,
                typeApprove: type,
            })
            .subscribe(
                (res) => {
                    if (res['data'] && res['data'] === true) {
                        this.toast.showSuccess(
                            'Thông báo',
                            'Cập nhật trạng thái bản ghi thành công'
                        );
                        this.doClose();
                    } else {
                        this.toast.showSuccess(
                            'Thông báo',
                            'Cập nhật trạng thái bản ghi không thành công. Vui lòng thực hiện lại.'
                        );
                    }
                    this.loading = false;
                },
                () => {
                    this.loading = false;
                }
            );
    }

    doPublish() {
        let params: Object = {
            title: 'Xác nhận',
            message: 'Bạn có chắc chắn muốn xuất bản bài viết này?',
        };
        this.dialog
            .open(DialogCommonComponent, {
                width: '25%',
                data: params,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result && result['rs'] === true) {
                    this.api
                        .post(ARTICLE_DETAIL_LANG.PUBLISH, this.dataInput.item)
                        .subscribe(
                            (res) => {
                                if (res.data == true) {
                                    this.toast.showSuccess(
                                        'Xuất bản bài viết thành công!'
                                    );
                                }
                                this.doClose();
                            },
                            (error) => {
                                this.toast.showError(
                                    error.message ? error.message : error
                                );
                            }
                        );
                }
            });
    }

    getDataFeedbackDetail(articleDetailId: number) {
        let paramBody: object = {
            articleDetailId: articleDetailId,
        };
        this.api.get(ARTICLE_DETAIL.FEEDBACK, paramBody).subscribe(
            (res) => {
                if (res['data']) {
                    this.feedbackData = res['data'];
                }
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }
}
