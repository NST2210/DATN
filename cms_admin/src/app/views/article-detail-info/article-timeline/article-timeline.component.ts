import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ARTICLE_DETAIL_HISTORY } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';

@Component({
    selector: 'app-article-timeline',
    templateUrl: './article-timeline.component.html',
    styleUrls: ['./article-timeline.component.scss'],
})
export class ArticleTimelineComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    articleDetailId: number;
    dataList: any = [];

    constructor(
        private dialogRef: MatDialogRef<ArticleTimelineComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {
        this.title = dataInput['title'];
        this.articleDetailId = dataInput['articleId'];
    }

    ngOnInit(): void {
        this.doGetHistoryArticle();
    }

    doGetHistoryArticle() {
        let paramBody: any = {
            articleDetailId: this.articleDetailId,
        };
        this.api.get(ARTICLE_DETAIL_HISTORY.GET_HISTORY_ARTICLE, paramBody)
            .subscribe((res) => {
                this.dataList = res['data'];
            }, (error) => {
                this.toast.showError(error.message ? error.message : error);
            }
            );
    }

    doClose() {
        this.dialogRef.close();
    }
}
