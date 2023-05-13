import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastNotiService {

  constructor(
    private toastr: ToastrService
  ) { }

  showSuccess(title?: string, message?: string) {
    this.toastr.success(message, title, {
      enableHtml: true,
      timeOut: 4000
    })
  }
  showInfo(title: string, message: string) {
    this.toastr.info(message, title, {
      enableHtml: true,
      timeOut: 4000
    })
  }
  showWarning(title: string, message: string) {
    this.toastr.warning(message, title, {
      enableHtml: true,
      timeOut: 4000
    })
  }
  showError(title?: string, message?: string) {
    this.toastr.error(message, title, {
      enableHtml: true,
      timeOut: 4000
    })
  }

}
