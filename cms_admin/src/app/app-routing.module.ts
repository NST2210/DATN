import { SyncDataComponent } from './views/admin/sync-data/sync-data.component';
import { ArticleApproveComponent } from './views/article-approve/article-approve.component';
import { ForgotPasswordComponent } from './views/pages/forgot-password/forgot-password.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './containers';
import { CompanyLanguageComponent } from './views/admin/company-language/company-language.component';
import { CompanyComponent } from './views/admin/company/company.component';
import { LanguagesComponent } from './views/admin/languages/languages.component';
import { MenusGroupComponent } from './views/admin/menus-group/menus-group.component';
import { PortalFlowComponent } from './views/admin/portal/portal-flow/portal-flow.component';
import { PortalMenuComponent } from './views/admin/portal/portal-menu/portal-menu.component';
import { PortalComponent } from './views/admin/portal/portal.component';
import { VideosComponent } from './views/admin/portal/videos/videos.component';
import { RolesComponent } from './views/admin/roles/roles.component';
import { UsersComponent } from './views/admin/users/users.component';
import { ArticleDetailInfoComponent } from './views/article-detail-info/article-detail-info.component';
import { LoginComponent } from './views/pages/login/login.component';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { ArticlePublishComponent } from './views/admin/article-publish/article-publish.component';
import { ImagesComponent } from './views/admin/images/images.component';
import { PortalArticleGroupComponent } from './views/admin/portal/portal-article-group/portal-article-group.component';
import { PortalIntroduceComponent } from './views/admin/portal/portal-introduce/portal-introduce.component';
import { ReportComponent } from './views/admin/report/report.component';
import { PortalMailComponent } from './views/admin/portal/portal-mail/portal-mail.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ImgVideosPublishComponent } from './views/admin/img-videos-publish/img-videos-publish.component';
import { BannerComponent } from './views/admin/portal/banner/banner.component';
import { PartnerComponent } from './views/partner/partner.component';
import { ContactAndFeedbackComponent } from './views/contact-and-feedback/contact-and-feedback.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: '',
        component: DefaultLayoutComponent,
        data: {
            title: 'Home',
        },
        children: [
            {
                path: 'home',
                component: DashboardComponent,
            },
            {
                path: 'roles',
                component: RolesComponent,
            },
            {
                path: 'menus',
                component: MenusGroupComponent,
            },
            {
                path: 'language',
                component: LanguagesComponent,
            },
            {
                path: 'company',
                component: CompanyComponent,
            },
            {
                path: 'companyLanguage',
                component: CompanyLanguageComponent,
            },
            {
                path: 'users',
                component: UsersComponent,
            },
            {
                path: 'article',
                component: ArticleDetailInfoComponent,
            },
            {
                path: 'portal',
                component: PortalComponent,
            },
            {
                path: 'flows',
                component: PortalFlowComponent,
            },
            {
                path: 'videos',
                component: VideosComponent,
            },
            {
                path: 'portal-menu',
                component: PortalMenuComponent,
            },
            {
                path: 'portal-introduce',
                component: PortalIntroduceComponent,
            },
            {
                path: 'portal-article-group',
                component: PortalArticleGroupComponent,
            },
            {
                path: 'push-article',
                component: ArticlePublishComponent,
            },
            {
                path: 'imgs',
                component: ImagesComponent,
            },
            {
                path: 'report',
                component: ReportComponent,
            },
            {
                path: 'mail-config',
                component: PortalMailComponent,
            },
            {
                path: 'approve',
                component: ArticleApproveComponent,
            },
            {
                path: 'synch',
                component: SyncDataComponent,
            },
            {
                path: 'publishImgVideos',
                component: ImgVideosPublishComponent,
            },
            {
                path: 'banner',
                component: BannerComponent,
            },
            {
                path: 'contact-feedback',
                component: ContactAndFeedbackComponent,
            },
            {
                path: 'partner',
                component: PartnerComponent,
            },
        ],
    },
    {
        path: '404',
        component: Page404Component,
        data: {
            title: 'Page 404',
        },
    },
    {
        path: '500',
        component: Page500Component,
        data: {
            title: 'Page 500',
        },
    },
    {
        path: 'login',
        component: LoginComponent,
        data: {
            title: 'Login Page',
        },
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: {
            title: 'Login Page',
        },
    },
    { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'top',
            anchorScrolling: 'enabled',
            initialNavigation: 'enabledBlocking',
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
