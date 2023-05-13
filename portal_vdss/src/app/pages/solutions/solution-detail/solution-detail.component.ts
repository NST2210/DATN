import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { LanguageCodeService } from 'src/app/common/service/language/language-code';
import { ToastNotiService } from 'src/app/common/service/toast/toast-noti.service';
import { FEEDBACK, SOLUTION_VIEW_DETAIL } from '../../../common/enums/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-solution-detail',
  templateUrl: './solution-detail.component.html',
  styleUrls: ['./solution-detail.component.scss'],
})
export class SolutionDetailComponent implements OnInit {
  contentReplace!: SafeHtml;
  articleDetail!: any;
  artLangId!: number;
  contentCount: number = 1000;
  messageSuccess!: string;
  showWarning!: string;
  disMessageSuccess!: string;
  error!: string;
  notification!: string;
  warning!: string;
  articleDetailId!: string;
  langCode!: string;
  portalCode: string = environment.portalCode;
  menuCode!: string;

  constructor(
    private route: ActivatedRoute,
    private api: FetchApiService,
    private formBuilder: FormBuilder,
    private toast: ToastNotiService,
    public lang: LangAppService,
    public lag: LanguageCodeService,
    private _sanitizer: DomSanitizer
  ) {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params['langCode'] && params['articleDetailId']) {
        this.langCode = params['langCode'];
        this.articleDetailId = params['articleDetailId'];
        if (params['articleDetailId']) {
          this.getSolutionViewDetail();
        }
      }
    });
    // this.getSolutionViewDetail()
  }

  feedbackForm!: FormGroup;
  isSubmitted: boolean = false;

  ngOnInit(): void {
    const nav = document.getElementById('mainNav');
    nav?.classList.add('scrolled');
    this.buildForm();
    this.buildToast();
  }

  buildToast() {
    this.messageSuccess = this.lang.parseTextCommon('messageSuccess');
    this.showWarning = this.lang.parseTextCommon('showWarning');
    this.disMessageSuccess = this.lang.parseTextCommon('disMessageSuccess');
    this.error = this.lang.parseTextCommon('error');
    this.notification = this.lang.parseTextCommon('notification');
    this.warning = this.lang.parseTextCommon('warning');
  }

  // getSolutionViewDetail() {
  //   if (this.artLangId) {
  //     this.api.get(SOLUTION_VIEW_DETAIL.GET_SOLUTION_DETAIL + this.artLangId).subscribe(
  //       (res: any) => {
  //         this.articleDetail = res.data
  //       },
  //       (error: any) => { }
  //     );
  //   }
  // }
  getSolutionViewDetail() {
    if (this.articleDetailId) {
      this.api
        .get(SOLUTION_VIEW_DETAIL.GET_SOLUTION_DETAIL, {
          articleDetailId: this.articleDetailId,
          langCode: this.lag.getLangCodeActive(),
        })
        .subscribe({
          next: (res: any) => {
            if (res.data) {
              this.articleDetail = res.data;
              let rsContent = res.data['content'];
              rsContent = rsContent
                // .replace(/<s>(.*?)<\/s>/g, '')
                // .replace(/<del.?>(.?)<\/del>/g, '')
                // .replace(/<ins.*?>/g, '<ins>')
                // .replace(
                //   /<span style=".?text-decoration:line-through.?>(.*?)<\/span>/g,
                //   ''
                // )
                // .replace(
                //   /<figure/g,
                //   '<figure style="width: 100%; display: grid; float:left;"'
                // )
                // .replace(
                //   /<img/g,
                //   '<img style ="object-fit: contain; min-width: 50%; text-align: center; max-width: 100%; border-radius: 10px;" data-bs-toggle="modal" *ngIf="arr && arr.length > 0"data-bs-target="#staticBackdrop2"')
                // .replace(/<ins\b/gi, '<span')
                // .replace(/<\/ins>/gi, '</span>')
                // .replace(/  +/g, ' ')
                // .replace(
                //   /<p style="/g,
                //   '<p style="text-indent:0pt; width: 100%;'
                // );
                .replace(/<s>(.*?)<\/s>/g, '')
                .replace(/<del.?>(.?)<\/del>/g, '')
                .replace(/<ins.*?>/g, '<ins>')
                .replace(/<span style=".?text-decoration:line-through.?>(.*?)<\/span>/g, '')
                .replace(/<figure/g, '<figure style="width: 100%; float:left; text-align: center;"')
                .replace(/<img/g, '<img style ="object-fit: contain; min-width: 50%; text-align: center; max-width: 100%; border-radius: 10px;" data-bs-toggle="modal" *ngIf="arr && arr.length > 0"data-bs-target="#staticBackdrop2"')
                .replace(/<ins\b/gi, '<span')
                .replace(/<\/ins>/gi, '</span>')
                .replace(/  +/g, ' ')
                .replace(/<tr><td>/g, '')
                .replace(/<table/g, '<table style="width:100%";')
                .replace(/<tbody/g, '<tbody style="width:100%"')
                .replace(/<tr/g, '<tr style="width:100%; "')
                .replace(/<td.*?>/g, '<td style="width:100%;text-align: center; "')
                .replace(/<h1 style=\"margin-top:0pt; margin-bottom:0pt; text-indent:36pt;/g, '<h1 style=\"margin-top:0pt; margin-bottom:0pt;text-indent:0pt;font-weight: bold; ')
                .replace(/<p style=\"margin-top:0pt; margin-bottom:0pt; text-indent:36pt;/g, '<p style=\"margin-top:0pt; margin-bottom:0pt;text-indent:0pt; ');
              this.contentReplace =
                this._sanitizer.bypassSecurityTrustHtml(rsContent);
            } else {
              $('.contact').css({ 'margin-top': '71px' });
            }
          },
          error: (error: any) => {},
        });
    }
  }

  feedbackChange(data: any) {
    if (this.contentCount > 0) this.contentCount = 1000 - data.length;
  }

  doFeedback() {
    this.buildToast();
    this.isSubmitted = true;
    if (this.feedbackForm.invalid) {
      this.toast.showWarning(this.warning, this.showWarning);
      return;
    }

    let dataBody = this.feedbackForm.value;
    dataBody['articleDetailId'] = this.articleDetailId;
    dataBody['portalCode'] = this.portalCode;

    this.api.post(FEEDBACK.SAVE, dataBody).subscribe(
      (rs: any) => {
        this.isSubmitted = false;
        this.feedbackForm.reset();
        this.contentCount = 1000;
        this.toast.showSuccess(this.notification, this.messageSuccess);
      },
      (error: any) => {
        this.isSubmitted = false;
        this.toast.showError(this.error, this.disMessageSuccess);
      }
    );
  }

  buildForm() {
    this.feedbackForm = this.formBuilder.group({
      name: [
        null,
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(
            "^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ'sW|_ \\/.-]+$"
          ),
        ],
      ],
      email: [
        null,
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(
            '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$'
          ),
        ],
      ],
      content: [null, [Validators.required, Validators.maxLength(1000)]],
      mobilePhone: [
        null,
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.pattern('[- +()0-9]{10,12}'),
        ],
      ],
    });
  }
}
