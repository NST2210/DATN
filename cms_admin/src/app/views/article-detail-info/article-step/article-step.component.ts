import { Component, Input, OnInit } from '@angular/core';
import { PORTAL_FLOW } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import * as _ from 'lodash';

@Component({
    selector: 'article-step',
    templateUrl: './article-step.component.html',
    styleUrls: ['./article-step.component.scss'],
})
export class ArticleStepComponent implements OnInit {
    @Input() articleDetailLangId: number = 0;
    loading: boolean = false;

    fowStep: any = [];
    stepCurrent: any;

    constructor(
        private api: FetchApiService,
        private toast: ToastNotiService
    ) { }

    ngOnInit(): void { }

    ngOnChanges() {
        if (this.articleDetailLangId && this.articleDetailLangId > 0) {
            this.getFlowStep();
        }
    }

    getFlowStep() {
        this.loading = true;
        this.api.get(PORTAL_FLOW.FLOW_STEP, {
            articleDetailLangId: this.articleDetailLangId,
        }).subscribe((res) => {
            this.loading = false;
            this.fowStep = res['data'];
            let stepNext = _.filter(this.fowStep, (obj) => {
                return (obj["flowStatus"] === null || obj["flowStatus"] === 0);
            });

            if (stepNext && stepNext.length > 0) {
                this.stepCurrent = stepNext[0]["flowStep"];
            }
        },
            () => {
                this.loading = false;
            }
        );
    }

    appendClassParent(item: any) {
        let strClass = "";
        if (item) {
            if (this.stepCurrent === item["flowStep"]) {
                strClass += " pulse";
            }
        }

        return strClass;
    }

    appendClass(item: any) {
        let strClass = "step ";

        if (item["flowStatus"] === 1) {
            strClass += " done";
        }
        else if (this.stepCurrent === item["flowStep"]) {
            strClass += " active";
        }

        return strClass;
    }

    appendClassDesc(item: any) {
        let strClass = "";

        if (item["flowStatus"] && item["flowStatus"] === 1) {
            strClass = "txt-desc-done";
        } else {
            if (this.stepCurrent === item["flowStep"]) {
                strClass = " txt-desc-active";
            }
            //  else {
            //     strClass = "txt-desc-process";
            // }
        }

        return strClass;
    }
}
