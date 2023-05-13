import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LanguageCodeService {
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
}
