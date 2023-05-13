import { Component, Inject, OnInit } from '@angular/core';
import { HOME_PAGE, INTRODUCE, RECRUITMENT } from "../../common/enums/EApiUrl";
import { FetchApiService } from "../../common/service/api/fetch-api.service";
import { LanguageCodeService } from "../../common/service/language/language-code";
import { environment } from "../../../environments/environment";
import { DialogRecruitmentComponent } from './dialog-recruitment/dialog-recruitment.component';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastNotiService } from 'src/app/common/service/toast/toast-noti.service';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';

@Component({
  selector: 'app-recruitment',
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.scss']
})
export class RecruitmentComponent implements OnInit {
  numRecruitment!: number
  listRecruitment!: any[]
  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    public dialog: MatDialog,
    private toast: ToastNotiService,
    public lang: LangAppService,
    
    ) { }

  ngOnInit(): void {
    this.getAllRecruitment()
  }

  //=== get all  Recruitment
  getAllRecruitment() {
    let param = {
      portalCode: environment.portalCode,
      langCode: this.langCodeService.getLangCodeActive()
    }
    this.api.get(RECRUITMENT.GET_ALL_RECRUITMENT, param).subscribe((res) => {
      this.numRecruitment = res.data.numRecruitment
      this.listRecruitment = res.data.listRecruitment
    }, (error) => {
    })
  }

  openDialog(item: any): any {
    let param: Object = {
      artLangId: item['artLangId'],
      // title: 'Thông tin ứng tuyển',
    }
    const dialogRef = this.dialog.open(DialogRecruitmentComponent, {
      data: param,
      panelClass :['dialog'],
      // disableClose: true,
    })
    dialogRef.afterClosed().subscribe((res) => {
      if (res != 1 && res != undefined) {
        this.toast.showSuccess("Thông báo", "Gửi thông tin ứng tuyển thành công")
      }
    })

  }

}
