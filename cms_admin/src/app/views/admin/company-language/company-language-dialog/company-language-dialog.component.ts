import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {DialogValidateComponent} from 'src/app/common/GUI/dialog-validate/dialog-validate.component';
import {CompanyLanguageComponent} from '../company-language.component';
import {COMPANY_LANGUAGE_ENDPOINT} from 'src/app/common/enum/EApiUrl';

@Component({
    selector: 'app-company-language-dialog',
    templateUrl: './company-language-dialog.component.html',
    styleUrls: ['./company-language-dialog.component.scss']
})
export class CompanyLanguageDialogComponent implements OnInit {

    loading: boolean = false;
    id!: number;
    title!: string;
    lstDpat: any = [];
    userForm!: FormGroup;
    lstRegis: any = [];
    disable: boolean = false;
    companyCode!: String;
    langCode!: String;
    listLang: any = [];
    isView!: boolean;

    constructor(
        private dialogRef: MatDialogRef<CompanyLanguageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private fb: FormBuilder,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.title = this.data["title"];
        this.buildForm();
        if (this.data["companyLanguageId"]) {
            this.getRowCompanyLanguage(this.data["companyLanguageId"]);
        } else {
            this.userForm['controls']['companyCode'].setValue(this.data["companyCode"]);
            this.userForm.controls["companyCode"].disable();
        }
        this.companyCode = this.data.companyCode;
        this.dataSearch();
        this.isView = this.data.isView;
    }

    buildForm() {
        this.userForm = this.fb.group({
            'companyCode': ['', [
                Validators.required
            ]],
            'langCode': ['', [
                Validators.required
            ]],
            'companyName': ['', [
                Validators.required
            ]],
            'companyPhone': ['', [
                Validators.required
            ]],
            'companyMail': ['', [
                Validators.required,
                Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
            ]],
            'companyFacebook': ['', [
                Validators.required
            ]],
            'companyTwitter': ['', [
                Validators.required
            ]],
            'companyIn': ['', [
                Validators.required
            ]],
            'companyAddr': ['', [
                Validators.required
            ]],
        });

    }

    dataSearch(): any {
        this.api.post(COMPANY_LANGUAGE_ENDPOINT.GET_DATA_LANG + this.companyCode).subscribe((res) => {
            this.listLang = res.data;
        })
    }

    getRowCompanyLanguage(id: any) {
        let idCompanyLanguage: number = id;
        this.api.post(COMPANY_LANGUAGE_ENDPOINT.GET_COMPANY_LANGUAGE_DETAIL + idCompanyLanguage).subscribe((res) => {
            if (res.data) {
                for (let obj of this.listLang) {
                    if (obj.langCode === res.data.langCode) {
                        this.userForm['controls']['langCode'].setValue(obj.langCode);
                        this.langCode = obj.langCode;
                    }
                }

                this.userForm['controls']['companyCode'].setValue(res.data["companyCode"]);
                this.userForm['controls']['companyName'].setValue(res.data["companyName"]);
                this.userForm['controls']['companyAddr'].setValue(res.data["companyAddr"]);
                this.userForm['controls']['companyPhone'].setValue(res.data["companyPhone"]);
                this.userForm['controls']['companyMail'].setValue(res.data["companyMail"]);
                this.userForm['controls']['companyFacebook'].setValue(res.data["companyFacebook"]);
                this.userForm['controls']['companyTwitter'].setValue(res.data["companyTwitter"]);
                this.userForm['controls']['companyIn'].setValue(res.data["companyIn"]);

                this.userForm.controls["companyCode"].disable();
                this.userForm.controls["langCode"].disable();
            }
        })
    }


    doSave(): any {

        let dataSave = this.userForm.value;
        if (this.data["companyLanguageId"]) {
            this.id = this.data["companyLanguageId"];
        }

        let param = {
            id: this.id,
            companyCode: this.companyCode || dataSave.companyCode,
            langCode: this.langCode || dataSave.langCode,
            lanngName: dataSave.langName,
            companyName: dataSave.companyName,
            companyAddr: dataSave.companyAddr,
            companyPhone: dataSave.companyPhone,
            companyMail: dataSave.companyMail,
            companyFacebook: dataSave.companyFacebook,
            companyTwitter: dataSave.companyTwitter,
            companyIn: dataSave.companyIn,
        }

        this.api.post(COMPANY_LANGUAGE_ENDPOINT.SAVE_OR_UPDATE, param).subscribe((res) => {
            if (res.data !== null) {
                let param: Object = {
                    title: 'Cảnh báo',
                    message: res.data,
                };
                this.dialog.open(DialogValidateComponent, {width: '40%', data: param, disableClose:true});
            } else {
                this.dialogRef.close(0);
            }
        })
    }


    close(): any {
        this.dialogRef.close(1);
    }
}
