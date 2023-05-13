import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LangAppService } from 'src/app/common/service/language/lang-app.service';
import { MenuModel } from '../../common/model/MenuModel';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() menus: Array<MenuModel> = [];

  @Input() data: any;

  constructor(private router: Router, public lang: LangAppService) {}

  shareLink(socialType: number) {
    let navUrl;

    switch (socialType) {
      case 0:
        navUrl = 'https://www.facebook.com/sharer/sharer.php?u=';
        break;
      case 1:
        navUrl = 'https://twitter.com/intent/tweet?text=';
        break;
      case 2:
        navUrl = 'https://www.linkedin.com/shareArticle?url=';
        break;
      case 3:
        navUrl = 'https://www.instagram.com/sharer.php?u=';
        break;
      default:
        break;
    }
    navUrl += this.router.url;
    window.open(navUrl, '_blank');
  }
  scroll_first() {
    window.scroll(0, 0);
  }
}
