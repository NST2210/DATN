import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as _ from 'lodash';
import {ARTICLE_DETAIL} from 'src/app/common/enum/EApiUrl';
import {ERole} from 'src/app/common/enum/ERole';
import {ArticleViewDetailModel} from 'src/app/common/model/ArticleViewDetailModel';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {AuthService} from 'src/app/common/services/auth/auth.service';
import {HelperService} from 'src/app/common/services/helper/helper.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';

@Component({
    selector: 'app-article-detail-feedback',
    templateUrl: './article-detail-feedback.component.html',
    styleUrls: ['./article-detail-feedback.component.scss']
})
export class ArticleDetailFeedbackComponent implements OnInit {

    loading: boolean = false;
    title!: string;
    roleApproved: boolean = false;
    disable: boolean = false;

    listArticleFeedback: any = [];

    articleDetail: ArticleViewDetailModel = new ArticleViewDetailModel();
    articleDetailId!: number;
    isView?: boolean;

    constructor(
        public helper: HelperService,
        private dialogRef: MatDialogRef<ArticleDetailFeedbackComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private auth: AuthService,
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
        if (this.articleDetailId && portalCode) {
            this.getDataFeedbackDetail(this.articleDetailId);
        }

    }

    getDataFeedbackDetail(articleDetailId: number) {
        let paramBody: object = {
            articleDetailId: articleDetailId,
        }
        this.api.get(ARTICLE_DETAIL.FEEDBACK, paramBody).subscribe(
            (res) => {
                if (res['data']) {
                    this.listArticleFeedback = res['data'];
                    if (this.listArticleFeedback.length == 0) {
                        this.isView = false;
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
}
