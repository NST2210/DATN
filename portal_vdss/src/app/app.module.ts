import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CurrencyPipe, DecimalPipe, HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorIntl, MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from "ngx-toastr";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppHttpInterceptor } from "./common/helper/http.interceptor";
import { ContactComponent } from './pages/contact/contact.component';
import { FooterComponent } from './pages/footer/footer.component';
import { HeaderComponent } from './pages/header/header.component';
import { HomesComponent } from './pages/homes/homes.component';
import { IntroduceComponent } from './pages/introduce/introduce.component';
import { NewsDetailComponent } from './pages/news/news-detail/news-detail.component';
import { NewsComponent } from './pages/news/news.component';
import { CustomPaginator } from './pages/paginator-component/CustomPaginator';
import { DialogRecruitmentComponent } from './pages/recruitment/dialog-recruitment/dialog-recruitment.component';
import { RecruitmentComponent } from './pages/recruitment/recruitment.component';
import { SolutionDetailComponent } from './pages/solutions/solution-detail/solution-detail.component';
import { SolutionsComponent } from './pages/solutions/solutions.component';
import { BreadcrumbsComponent } from './pages/breadcrumbs/breadcrumbs.component';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { GroupSolutionsComponent } from './pages/group-solutions/group-solutions.component';
import { FormFocusDirective } from './common/directive/form-focus.directive';


@NgModule({
  declarations: [
    AppComponent,
    SolutionsComponent,
    IntroduceComponent,
    ContactComponent,
    RecruitmentComponent,
    FooterComponent,
    HeaderComponent,
    HomesComponent,
    NewsComponent,
    SolutionDetailComponent,
    NewsDetailComponent,
    DialogRecruitmentComponent,
    BreadcrumbsComponent,
    GroupSolutionsComponent,
    FormFocusDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MatSelectModule,
    BrowserAnimationsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ToastrModule.forRoot(),
    MatMenuModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatCardModule,
    NgxTrimDirectiveModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpInterceptor,
      multi: true
    },
    CurrencyPipe,
    DecimalPipe,
    { provide: MatPaginatorIntl, useClass: CustomPaginator },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
