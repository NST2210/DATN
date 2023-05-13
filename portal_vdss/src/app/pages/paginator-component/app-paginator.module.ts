import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomPaginator } from './CustomPaginator';
import { AppPaginatorComponent } from './app-paginator/app-paginator.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';

export{
  CustomPaginator
}

@NgModule({
  declarations: [
    AppPaginatorComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  exports: [
    AppPaginatorComponent
  ]
})
export class AppPaginatorModule { }
