import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { environment } from '../../../environments/environment';
import { FEEDBACK, HOME_PAGE } from '../../common/enums/EApiUrl';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { LanguageCodeService } from '../../common/service/language/language-code';
import { ToastNotiService } from '../../common/service/toast/toast-noti.service';

@Component({
  selector: 'app-homes',
  templateUrl: './homes.component.html',
  styleUrls: ['./homes.component.scss'],
})
export class HomesComponent implements OnInit {
  listSolution!: any[];
  listNew!: any[];
  listTrustedPartner!: any[];
  contentCount: number = 1000;
  feedbackForm!: FormGroup;
  isSubmitted: boolean = false;
  listAllIntroduce?: any[];
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
    private router: Router,
    public lang: LangAppService
  ) { }

  ngOnInit(): void {
    this.buildToast();
    this.buildForm();
    this.getAllIntroduce();
    this.getAllNews();
    this.getAllTrustedPartner();
    this.getAllSolutionVer2();
  }

  buildToast() {
    this.messageSuccess = this.lang.parseTextCommon('messageSuccess');
    this.showWarning = this.lang.parseTextCommon('showWarning');
    this.disMessageSuccess = this.lang.parseTextCommon('disMessageSuccess');
    this.error = this.lang.parseTextCommon('error');
    this.notification = this.lang.parseTextCommon('notification');
    this.warning = this.lang.parseTextCommon('warning');
  }
  //=== get all Introduce
  getAllIntroduce() {
    const param = {
      portalCode: environment.portalCode,
      langCode: this.langCodeService.getLangCodeActive(),
    };
    this.api.get(HOME_PAGE.GET_ALL_INTRODUCE, param).subscribe({
      next: (res) => {
        this.listAllIntroduce = res.data;
      },
      error: (error) => {
        console.log('error', error);
      },
    });
  }
  //=== get all solution
  getAllSolution() {
    const param = {
      portalCode: environment.portalCode,
      langCode: this.langCodeService.getLangCodeActive(),
    };
    this.api.get(HOME_PAGE.SOLUTION, param).subscribe({
      next: (res) => {
        this.listSolution = res.data;
      },
      error: (error) => {
        console.log('error', error);
      },
    });
  }

  getAllSolutionVer2() {
    const param = {
      portalCode: environment.portalCode,
      langCode: this.langCodeService.getLangCodeActive(),
    };
    this.api.get(HOME_PAGE.SOLUTION_V2, param).subscribe(
      (res) => {
        this.listSolution = res.data;
      },
      (error) => {
        console.log('error', error);
      }
    );
  }

  //=== get all Trusted Partner
  getAllTrustedPartner() {
    const param = {
      portalCode: environment.portalCode,
    };
    this.api.get(HOME_PAGE.LINKED, param).subscribe({
      next: (res) => {
        this.listTrustedPartner = res.data;
        // if (this.listTrustedPartner.length < 10) {
        //   this.listTrustedPartner = this.listTrustedPartner.concat(res.data);
        // }
      },
      error: (error) => {
        console.log('error', error);
      },
    });
  }

  gotoLinkTrustedPartner(trustedPartner: any) {
    window.open(trustedPartner.link, '_blank');
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
          // Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$'),
        ],
      ],
    });
  }

  feedbackChange(data: any) {
    if (this.contentCount > 0) this.contentCount = 1000 - data.length;
  }

  //=== get all new
  getAllNews() {
    let param = {
      portalCode: environment.portalCode,
      langCode: this.langCodeService.getLangCodeActive(),
    };
    this.api.get(HOME_PAGE.NEWS, param).subscribe(
      (res) => {
        this.listNew = res.data;
      },
      (error) => {
        console.log('error', error);
      }
    );
  }

  doFeedback() {
    this.buildToast();
    this.isSubmitted = true;
    if (this.feedbackForm.invalid) {
      this.toast.showWarning(this.warning, this.showWarning);
      return;
    }

    let dataBody = this.feedbackForm.value;
    dataBody['portalCode'] = this.portalCode;

    this.api.post(FEEDBACK.SAVE, dataBody).subscribe(
      () => {
        this.isSubmitted = false;
        this.feedbackForm.reset();
        this.contentCount = 1000;
        this.toast.showSuccess(this.notification, this.messageSuccess);
      },
      () => {
        this.isSubmitted = false;
        this.toast.showError(this.error, this.disMessageSuccess);
      }
    );
  }

  //=== xem chi tiet bai viet
  doViewDetailNew(item: any) {
    this.router.navigate(['/new_detail'], {
      queryParams: {
        articleDetailId: item.articleDetailId,
        langCode: this.langCodeService.getLangCodeActive(),
      },
    });
  }

  //=== xem chi tiet giai phap
  doViewDetailSolution(item: any) {
    // this.router.navigate(['/solution_detail'], { queryParams: { artLangId: item.artLangId } });
    this.router.navigate(['/group_solutions'], {
      queryParams: { groupCode: item.groupCode, menuCode: item.menuCode },
    });
  }

  //=== xem them nhom giai phap
  doViewGroupSolution() {
    // this.router.navigate(['/solution_detail'], { queryParams: { artLangId: item.artLangId } });
    this.router.navigate(['/group_solutions'], {
      queryParams: { menuCode: "MENU_2" },
    });
  }
}

