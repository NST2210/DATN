import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { environment } from "../../../environments/environment";
import { HOME_PAGE, INTRODUCE } from "../../common/enums/EApiUrl";
import { FetchApiService } from "../../common/service/api/fetch-api.service";
import { LanguageCodeService } from "../../common/service/language/language-code";

@Component({
  selector: 'app-introduce',
  templateUrl: './introduce.component.html',
  styleUrls: ['./introduce.component.scss']
})
export class IntroduceComponent implements OnInit {
  listAllIntroduce?: any[]
  contentReplace!: SafeHtml;
  constructor(
    private api: FetchApiService,
    private langCodeService: LanguageCodeService,
    public lang: LangAppService,
    private _sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getAllIntroduce()
  }


  //=== get all Introduce
  getAllIntroduce() {
    let param = {
      portalCode: environment.portalCode,
      langCode: this.langCodeService.getLangCodeActive()
    }
    this.api.get(INTRODUCE.GET_ALL_INTRODUCE, param).subscribe((res) => {
      this.listAllIntroduce = res.data;
      if (res.data) {
        let rsContent = res.data[0]['content'];
        rsContent = rsContent
          .replace(/<s>(.*?)<\/s>/g, '')
          .replace(/<del.?>(.?)<\/del>/g, '')
          .replace(/<ins.*?>/g, '<ins>')
          .replace(/<span style=".?text-decoration:line-through.?>(.*?)<\/span>/g, '')
          .replace(/<figure/g, '<figure style="width: 50%; display: grid; float:left;"')
          .replace(/<img/g, '<img style ="object-fit: contain; margin: 0px -10px; display: block; min-width: 98%; max-width: 100%; border-radius: 10px;" data-bs-toggle="modal" *ngIf="arr && arr.length > 0"data-bs-target="#staticBackdrop2"')
          .replace(/<ins\b/gi, '<span')
          .replace(/<\/ins>/gi, '</span>')
          .replace(/  +/g, ' ')
          .replace(/<p style="/g, '<p style="text-indent:0pt; width: 100%;');
        this.contentReplace = this._sanitizer.bypassSecurityTrustHtml(rsContent);
      }
    }, (error) => {
      console.log('error', error);
    })
  }
}
