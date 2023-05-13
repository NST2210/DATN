import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { CompanyComponent } from '../company.component';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogValidateComponent } from 'src/app/common/GUI/dialog-validate/dialog-validate.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { COMPANY_ENDPOINT } from 'src/app/common/enum/EApiUrl';

@Component({
  selector: 'app-company-dialog',
  templateUrl: './company-dialog.component.html',
  styleUrls: ['./company-dialog.component.scss']
})
export class CompanyDialogComponent implements OnInit {

  loading: boolean = false;
  id!: number;
  userForm!: FormGroup;
  title!: String;


  constructor(
    private dialogRef: MatDialogRef<CompanyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: FetchApiService,
    private toast: ToastNotiService,
    public dialog: MatDialog,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.title = this.data["title"];
    this.buildForm();
  
    if (this.data["CompanyId"]) {
      this.userForm['controls']['code'].setValue(this.data["code"]);
      this.userForm['controls']['isActive'].setValue(this.data["isActive"]);
      this.userForm.controls["code"].disable();
    } else {
      this.userForm['controls']['isActive'].setValue(1);
      this.userForm.controls["isActive"].disable();
    }
  }

  buildForm() {
    this.userForm = this.fb.group({
      'code': ['', [
        Validators.required
      ]],
      'isActive': ['', [
        Validators.required
      ]],
    });

  }


  doSave() {
    if (this.data["CompanyId"]) {
      this.id = this.data["CompanyId"];
    }
    let dataSave = this.userForm.value;
    let param = {
      id: this.id,
      code: dataSave.code,
      isActive: dataSave.isActive,
    }
    this.api.post(COMPANY_ENDPOINT.SAVE_OR_UPDATE, param).subscribe((res) => {
      if (res.data != null) {
        let param: Object = {
          title: 'Cảnh báo',
          message: res.error,
        };
        this.dialog.open(DialogValidateComponent, { width: '40%', data: param });
      }
      else {
        this.dialogRef.close(0);
      }
    })
  }
  close(): void {
    this.dialogRef.close(1);
  }

}
