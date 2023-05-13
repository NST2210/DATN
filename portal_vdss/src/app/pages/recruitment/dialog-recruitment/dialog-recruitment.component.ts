import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Event, NavigationEnd, Router } from '@angular/router';
import * as _ from 'lodash';
import { FEEDBACK } from 'src/app/common/enums/EApiUrl';
import { FetchApiService } from 'src/app/common/service/api/fetch-api.service';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { LanguageCodeService } from 'src/app/common/service/language/language-code';
import { ToastNotiService } from 'src/app/common/service/toast/toast-noti.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dialog-recruitment',
  templateUrl: './dialog-recruitment.component.html',
  styleUrls: ['./dialog-recruitment.component.scss'],
})
export class DialogRecruitmentComponent implements OnInit {
  feedbackForm!: FormGroup;
  isSubmitted: boolean = false;
  messageRecruitmentSuccess!: string;
  showWarning!: string;
  unMessageRecruitmentSuccess!: string;
  error!: string;
  notification!: string;
  warning!: string;
  uploadedFile: any;
  fileName: any;
  artLangId!: any;
  portalCode: string = environment.portalCode;

  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    private toast: ToastNotiService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DialogRecruitmentComponent>,
    private router: Router,
    public lang: LangAppService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.messageRecruitmentSuccess = this.lang.parseTextCommon(
      'messageRecruitmentSuccess'
    );
    this.showWarning = this.lang.parseTextCommon('showWarningUpload');
    this.unMessageRecruitmentSuccess = this.lang.parseTextCommon(
      'unMessageRecruitmentSuccess'
    );
    this.error = this.lang.parseTextCommon('error');
    this.notification = this.lang.parseTextCommon('notification');
    this.warning = this.lang.parseTextCommon('warning');
    this.buildForm();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.doClose();
      }
    });

    this.artLangId = this.data['artLangId'];
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
      content: [
        null,
        // [Validators.required, Validators.maxLength(1000)]
      ],
      mobilePhone: [
        null,
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.pattern(
            '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$'
          ),
          // Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$'),
        ],
      ],
      fileBase64: ['', [Validators.required]],
    });
  }

  doFeedback() {
    this.isSubmitted = true;
    if (this.feedbackForm.invalid) {
      this.toast.showWarning(this.warning, this.showWarning);
      return;
    }

    let dataBody = _.cloneDeep(this.feedbackForm.value);
    dataBody['articleDetailLangId'] = this.artLangId;
    dataBody['portalCode'] = this.portalCode;
    dataBody['fileName'] = this.fileName;
    this.api.post(FEEDBACK.SAVE, dataBody).subscribe(
      () => {
        this.isSubmitted = false;
        this.feedbackForm.reset();
        this.toast.showSuccess(
          this.notification,
          this.messageRecruitmentSuccess
        );
        this.doClose();
      },
      () => {
        this.isSubmitted = false;
        this.toast.showError(this.error, this.unMessageRecruitmentSuccess);
      }
    );
  }

  doClose() {
    this.dialogRef.close();
  }

  handleUpload(event: any) {
    const uploadedFile = event.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (uploadedFile && allowedTypes.includes(uploadedFile.type)) {
      let reader = new FileReader();

      reader.onload = () => {
        const base64String = btoa(reader.result as string);
        this.feedbackForm.controls['fileBase64'].setValue(base64String);
      };

      reader.readAsBinaryString(uploadedFile);

      this.fileName = uploadedFile.name;
      event.target.value = null;
    } else {
      this.toast.showWarning(
        this.warning,
        'Chỉ được upload file có định dạng là pdf, doc, docx.'
      );
    }
  }

  removeFile() {
    this.feedbackForm.controls['fileBase64'].setValue('');
    this.uploadedFile = null;
    this.fileName = null;
  }
}
