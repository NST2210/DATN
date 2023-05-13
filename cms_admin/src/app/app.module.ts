import {
    CommonModule,
    DatePipe,
    HashLocationStrategy,
    LocationStrategy,
} from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { DATE_FORMATS } from './common/utils/date-formats-utils';

import {
    PERFECT_SCROLLBAR_CONFIG,
    PerfectScrollbarConfigInterface,
    PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';

// Import containers
import {
    DefaultFooterComponent,
    DefaultHeaderComponent,
    DefaultLayoutComponent,
} from './containers';

import {
    AvatarModule,
    BadgeModule,
    BreadcrumbModule,
    ButtonGroupModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    FooterModule,
    FormModule,
    GridModule,
    HeaderModule,
    ListGroupModule,
    NavModule,
    ProgressModule,
    SharedModule,
    SidebarModule,
    TableModule,
    TabsModule,
    UtilitiesModule,
} from '@coreui/angular';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {
    MatPaginatorIntl,
    MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
    MatNativeDateModule,
} from '@angular/material/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ChartjsModule } from '@coreui/angular-chartjs';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { NgChartsConfiguration, NgChartsModule } from 'ng2-charts';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { CompanyLanguageDialogComponent } from 'src/app/views/admin/company-language/company-language-dialog/company-language-dialog.component';
import { CompanyDialogComponent } from 'src/app/views/admin/company/company-dialog/company-dialog.component';
import { RemoveSpecialDirective } from './common/directive/remove-special.directive';
import { UppercaseTextDirective } from './common/directive/uppercase-text.directive';
import { DateTransformDirective } from './common/directive/date-transform.directive';
import { DialogCommonComponent } from './common/GUI/dialog-common/dialog-common.component';
import { DialogDeleteComponent } from './common/GUI/dialog-delete/dialog-delete.component';
import { GridTableComponent } from './common/GUI/grid-table/grid-table.component';
import { ImagePreviewComponent } from './common/GUI/image-preview/image-preview.component';
import { LoadingComponent } from './common/GUI/loading/loading.component';
import { PieCharComponent } from './common/GUI/pie-char/pie-char.component';
import { ShareSocialComponent } from './common/GUI/share-social/share-social.component';
import { TablePaginatorComponent } from './common/GUI/table-paginator/table-paginator.component';
import { TreeViewComponent } from './common/GUI/tree-view/tree-view.component';
import { AppHttpInterceptor } from './common/helper/http.interceptor';
import { MatPaginatorIntlCro } from './common/utils/MatPaginatorIntlCro';
import { UserInfoDialogComponent } from './containers/default-layout/default-header/user-info-dialog/user-info-dialog.component';
import { ArticlePublishComponent } from './views/admin/article-publish/article-publish.component';
import { CompanyLanguageComponent } from './views/admin/company-language/company-language.component';
import { CompanyComponent } from './views/admin/company/company.component';
import { DialogDetailImageComponent } from './views/admin/images/dialog-detail-image/dialog-detail-image.component';
import { ImagesDialogComponent } from './views/admin/images/images-dialog/images-dialog.component';
import { ImagesComponent } from './views/admin/images/images.component';
import { LanguagesDialogComponent } from './views/admin/languages/languages-dialog/languages-dialog.component';
import { LanguagesComponent } from './views/admin/languages/languages.component';
import { MenusGroupDialogComponent } from './views/admin/menus-group/menus-group-dialog/menus-group-dialog.component';
import { MenusGroupPermissionComponent } from './views/admin/menus-group/menus-group-permission/menus-group-permission.component';
import { MenusGroupComponent } from './views/admin/menus-group/menus-group.component';
import { PortalArticleGroupDialogComponent } from './views/admin/portal/portal-article-group/portal-article-group-dialog/portal-article-group-dialog.component';
import { PortalArticleGroupComponent } from './views/admin/portal/portal-article-group/portal-article-group.component';
import { PortalDialogComponent } from './views/admin/portal/portal-dialog/portal-dialog.component';
import { PortalFlowDialogComponent } from './views/admin/portal/portal-flow-dialog/portal-flow-dialog.component';
import { PortalFlowComponent } from './views/admin/portal/portal-flow/portal-flow.component';
import { PortalMailDialogComponent } from './views/admin/portal/portal-mail/portal-mail-dialog/portal-mail-dialog.component';
import { PortalMailComponent } from './views/admin/portal/portal-mail/portal-mail.component';
import { PortalMenuDialogComponent } from './views/admin/portal/portal-menu/portal-menu-dialog/portal-menu-dialog.component';
import { PortalMenuComponent } from './views/admin/portal/portal-menu/portal-menu.component';
import { PortalUserPermissionComponent } from './views/admin/portal/portal-user-permission/portal-user-permission.component';
import { PortalUtilComponent } from './views/admin/portal/portal-util/portal-util.component';
import { PortalComponent } from './views/admin/portal/portal.component';
import { PortalFooterComponent } from './views/admin/portal/tab-util/portal-footer/portal-footer.component';
import { PortalLinkComponent } from './views/admin/portal/tab-util/portal-link/portal-link.component';
import { VideosDialogComponent } from './views/admin/portal/videos/videos-dialog/videos-dialog.component';
import { VideosComponent } from './views/admin/portal/videos/videos.component';
import { ReportComponent } from './views/admin/report/report.component';
import { RolesDialogComponent } from './views/admin/roles/roles-dialog/roles-dialog.component';
import { RolesComponent } from './views/admin/roles/roles.component';
import { UserForRoleComponent } from './views/admin/user-for-role/user-for-role.component';
import { UserDialogComponent } from './views/admin/users/user-dialog/user-dialog.component';
import { UsersSearchDialogComponent } from './views/admin/users/users-search-dialog/users-search-dialog.component';
import { UsersComponent } from './views/admin/users/users.component';
import { ArticleDetailFeedbackComponent } from './views/article-detail-info/article-detail-feedback/article-detail-feedback.component';
import { ArticleDetailInfoComponent } from './views/article-detail-info/article-detail-info.component';
import { ArticleDialogComponent } from './views/article-detail-info/article-dialog/article-dialog.component';
import { ArticleTimelineComponent } from './views/article-detail-info/article-timeline/article-timeline.component';
import { ArticlePreviewPortalComponent } from './views/article-preview-portal/article-preview-portal.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { CoreUIIconsComponent } from './views/icons/coreui-icons.component';
import { ForgotPasswordComponent } from './views/pages/forgot-password/forgot-password.component';
import { LoginComponent } from './views/pages/login/login.component';
import { ArticleApproveComponent } from './views/article-approve/article-approve.component';
import { ArticleApproveOrRejectComponent } from './views/article-approve/article-approve-or-reject/article-approve-or-reject.component';
import { SyncDataComponent } from './views/admin/sync-data/sync-data.component';
import { BreadcrumbsComponent } from './containers/default-layout/breadcrumbs/breadcrumbs.component';
import { ImgVideosPublishComponent } from './views/admin/img-videos-publish/img-videos-publish.component';
import { SyncDialogHistoryComponent } from './views/admin/sync-data/sync-dialog-history/sync-dialog-history.component';
import { ArticleStepComponent } from './views/article-detail-info/article-step/article-step.component';
import { ArticleSwitchUserComponent } from './views/article-approve/article-switch-user/article-switch-user.component';
import { PreviewWordComponent } from './views/article-detail-info/preview-word/preview-word.component';
import { UploadImagesDialogComponent } from './views/article-detail-info/upload-images-dialog/upload-images-dialog.component';
import { BannerComponent } from './views/admin/portal/banner/banner.component';
import { BannerDialogComponent } from './views/admin/portal/banner/banner-dialog/banner-dialog.component';
import { DragDropFileUploadDirective } from './common/directive/dragDropFileUpload/drag-drop-file-upload.directive';
import { PartnerComponent } from './views/partner/partner.component';
import { ContactAndFeedbackComponent } from './views/contact-and-feedback/contact-and-feedback.component';
import { PartnerDialogComponent } from './views/partner/partner-dialog/partner-dialog.component';
import { PortalIntroduceComponent } from './views/admin/portal/portal-introduce/portal-introduce.component';
import { PortalIntroduceDialogComponent } from './views/admin/portal/portal-introduce/portal-introduce-dialog/portal-introduce-dialog.component';
import { ArticleAttachComponent } from './views/article-detail-info/article-attach/article-attach.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
};

const APP_CONTAINERS = [
    DefaultFooterComponent,
    DefaultHeaderComponent,
    DefaultLayoutComponent,
];

@NgModule({
    declarations: [
        AppComponent,
        ...APP_CONTAINERS,
        LoadingComponent,
        ForgotPasswordComponent,
        LoginComponent,
        UsersComponent,
        CompanyComponent,
        CompanyDialogComponent,
        RolesComponent,
        GridTableComponent,
        UserForRoleComponent,
        DialogCommonComponent,
        TreeViewComponent,
        MenusGroupComponent,
        CoreUIIconsComponent,
        LanguagesComponent,
        LanguagesDialogComponent,
        CompanyLanguageComponent,
        CompanyLanguageDialogComponent,
        UserDialogComponent,
        ArticleDetailInfoComponent,
        ArticleDialogComponent,
        PortalComponent,
        PortalDialogComponent,
        PortalUtilComponent,
        PortalLinkComponent,
        PortalFooterComponent,
        ImagePreviewComponent,
        ArticlePreviewPortalComponent,
        ShareSocialComponent,
        RolesDialogComponent,
        PortalUserPermissionComponent,
        PortalFlowComponent,
        TablePaginatorComponent,
        PortalFlowDialogComponent,
        VideosComponent,
        VideosDialogComponent,
        PortalMenuComponent,
        PortalMenuDialogComponent,
        ArticlePublishComponent,
        ImagesComponent,
        ImagesDialogComponent,
        ArticleTimelineComponent,
        UsersSearchDialogComponent,
        PortalArticleGroupComponent,
        PortalArticleGroupDialogComponent,
        DialogDeleteComponent,
        MenusGroupDialogComponent,
        MenusGroupPermissionComponent,
        ArticleDetailFeedbackComponent,
        ReportComponent,
        PortalMailComponent,
        PortalMailDialogComponent,
        UppercaseTextDirective,
        DateTransformDirective,
        RemoveSpecialDirective,
        UserInfoDialogComponent,
        PortalMailDialogComponent,
        DashboardComponent,
        DialogDetailImageComponent,
        PieCharComponent,
        ArticleApproveComponent,
        ArticleApproveOrRejectComponent,
        SyncDataComponent,
        BreadcrumbsComponent,
        ImgVideosPublishComponent,
        SyncDialogHistoryComponent,
        ArticleStepComponent,
        ArticleSwitchUserComponent,
        PreviewWordComponent,
        UploadImagesDialogComponent,
        BannerComponent,
        BannerDialogComponent,
        DragDropFileUploadDirective,
        PartnerComponent,
        ContactAndFeedbackComponent,
        PartnerDialogComponent,
        PortalIntroduceComponent,
        PortalIntroduceDialogComponent,
        ArticleAttachComponent,
    ],
    imports: [
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        AvatarModule,
        BreadcrumbModule,
        FooterModule,
        DropdownModule,
        GridModule,
        HeaderModule,
        SidebarModule,
        IconModule,
        PerfectScrollbarModule,
        NavModule,
        ButtonModule,
        FormModule,
        UtilitiesModule,
        ButtonGroupModule,
        FormsModule,
        ReactiveFormsModule,
        SidebarModule,
        SharedModule,
        TabsModule,
        ListGroupModule,
        ProgressModule,
        BadgeModule,
        ListGroupModule,
        CardModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatPaginatorModule,
        MatMenuModule,
        MatIconModule,
        MatCheckboxModule,
        MatDialogModule,
        MatTreeModule,
        MatChipsModule,
        MatTooltipModule,
        CKEditorModule,
        MatTabsModule,
        MatSlideToggleModule,
        NgxTrimDirectiveModule,
        ToastrModule.forRoot(),
        MatDatepickerModule,
        MatNativeDateModule,
        CardModule,
        NavModule,
        IconModule,
        TabsModule,
        CommonModule,
        GridModule,
        ProgressModule,
        ReactiveFormsModule,
        ButtonModule,
        FormModule,
        ButtonModule,
        ButtonGroupModule,
        ChartjsModule,
        AvatarModule,
        TableModule,
        NgChartsModule,
        MatRadioModule,
        MatExpansionModule,
        PdfViewerModule,
    ],
    providers: [
        DatePipe,
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy,
        },
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AppHttpInterceptor,
            multi: true,
        },
        IconSetService,
        Title,
        { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro },
        { provide: NgChartsConfiguration, useValue: { generateColors: true } },
        {
            provide: MAT_DATE_LOCALE,
            useValue: 'en-GB',
        },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
