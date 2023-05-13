import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './pages/contact/contact.component';
import { HomesComponent } from './pages/homes/homes.component';
import { IntroduceComponent } from './pages/introduce/introduce.component';
import { NewsDetailComponent } from './pages/news/news-detail/news-detail.component';
import { NewsComponent } from './pages/news/news.component';
import { RecruitmentComponent } from './pages/recruitment/recruitment.component';
import { SolutionDetailComponent } from './pages/solutions/solution-detail/solution-detail.component';
import { SolutionsComponent } from './pages/solutions/solutions.component';
import { GroupSolutionsComponent } from './pages/group-solutions/group-solutions.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomesComponent },
  {
    path: 'group_solutions', component: GroupSolutionsComponent,
  },
  {
    path: 'solution', component: SolutionsComponent,
  },
  { path: 'solution_detail', component: SolutionDetailComponent },
  { path: 'introduce', component: IntroduceComponent },
  { path: 'news', component: NewsComponent },
  {
    path: 'new_detail', component: NewsDetailComponent,
  },
  { path: 'recruitment', component: RecruitmentComponent },
  { path: 'contact', component: ContactComponent },
  {path: '**', component: HomesComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
