import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class LangAppService {
  changeLangCode(langCode: string) {
    sessionStorage.removeItem(environment.langCode);
    sessionStorage.setItem(environment.langCode, langCode);
  }

  getLangCodeActive() {
    let langCode = sessionStorage.getItem(environment.langCode);
    if (langCode) {
      return langCode;
    } else {
      let lagDf = sessionStorage.getItem(environment.langCodeDefault);
      return lagDf;
    }
  }

  saveTextCommon(data: any) {
    sessionStorage.removeItem(environment.textCommon);
    sessionStorage.setItem(environment.textCommon, JSON.stringify(data));
  }

  parseTextCommon(strKey: string) {
    let textCommon: any = sessionStorage.getItem(environment.textCommon);
    if (textCommon) {
      let rsParse = JSON.parse(textCommon)['config_value'];
      let rs = JSON.parse(rsParse);
      return rs[strKey] ? rs[strKey] : '';
    }
  }
}
