import { Component, OnInit } from '@angular/core';
import { FetchApiService } from 'src/app/common/service/api/fetch-api.service';
import { LanguageCodeService } from "../../common/service/language/language-code";
import { ToastNotiService } from "../../common/service/toast/toast-noti.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FEEDBACK } from "../../common/enums/EApiUrl";
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  contentCount: number = 1000;
  feedbackForm!: FormGroup;
  isSubmitted: boolean = false;
  messageSuccess!: string;
  showWarning!: string;
  disMessageSuccess!: string;
  error!: string;
  notification!: string;
  warning!: string;
  portalCode: string = environment.portalCode;
  

  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    private toast: ToastNotiService,
    private formBuilder: FormBuilder,
    public lang: LangAppService
  ) {
  }

  ngOnInit(): void {
    this.buildToast();
    this.buildForm();

  }
  buildToast() {
    this.messageSuccess = this.lang.parseTextCommon('messageSuccess');
    this.showWarning = this.lang.parseTextCommon('showWarning');
    this.disMessageSuccess = this.lang.parseTextCommon('disMessageSuccess')
    this.error = this.lang.parseTextCommon('error')
    this.notification = this.lang.parseTextCommon('notification')
    this.warning = this.lang.parseTextCommon('warning')
  }
  buildForm() {
    this.feedbackForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.maxLength(100)]],
      email: [null, [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')
      ],
      ],
      content: [null, [Validators.required, Validators.maxLength(1000)]],
      mobilePhone: [null, [
        Validators.required,
        Validators.maxLength(15),
        Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$'),]
      ],
    });
  }

  feedbackChange(data: any) {
    if (this.contentCount > 0) this.contentCount = 1000 - data.length;
  }

  //=== send feedback
  doFeedback() {
    this.buildToast();
    this.isSubmitted = true;
    if (this.feedbackForm.invalid) {
      this.toast.showWarning(this.warning, this.showWarning);
      return;
    }

    let dataBody = this.feedbackForm.value;
    dataBody['portalCode'] = this.portalCode;
    // dataBody['articleDetailLangId'] = this.artLangId;

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
}
