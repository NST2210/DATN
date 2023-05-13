import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {DialogCommonComponent} from 'src/app/common/GUI/dialog-common/dialog-common.component';
import * as moment from 'moment';
import {CompanyLanguageDialogComponent} from './company-language-dialog/company-language-dialog.component';
import {EICON_TYPE} from 'src/app/common/enum/EType';
import {COMPANY_LANGUAGE_ENDPOINT} from 'src/app/common/enum/EApiUrl';

@Component({
    selector: 'app-company-language',
    templateUrl: './company-language.component.html',
    styleUrls: ['./company-language.component.scss']
})
export class CompanyLanguageComponent implements OnInit {


    loading: boolean = false;
    dataList: any = [];
    totalItems: number = 0;
    pageSize: number = 10;
    page: number = 0;
    langCode!: String;
    companyName!: String;
    createDate!: Date;
    obj: any = {};
    listCompany: any = [];
    columnsView: any = [];
    displayedColumns: string[] = [];
    companyCode!: String;

    tableColumns: any = [
        {
            name: 'companyCode',
            label: 'Công ty',
        },
        {
            name: 'langName',
            label: 'Tên ngôn ngữ',
        },
        {
            name: 'langCode',
            label: 'Ngôn ngữ',
        },
        {
            name: 'companyName',
            label: 'Tên công ty',
        },
        {
            name: 'createDate',
            label: 'Ngày tạo',
            options: {
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                }
            },
        },
        {
            name: 'companyAddr',
            label: 'Địa chỉ công ty',
        }
    ];

    tableAction: any = [
        {
            icon: 'fa fa-eye',
            iconType: EICON_TYPE.FONT_AWESOME,
            tooltip: 'Xem chi tiết',
            doAction: (item: any) => {
                this.doDetail(item);
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xóa dữ liệu',
            doAction: (item: any) => {
                this.doDelete(item);
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Sửa dữ liệu',
            doAction: (item: any) => {
                this.doUpdate(item);
            },
        },
    ];

    constructor(
        public dialog: MatDialog,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private router: ActivatedRoute,) {
    }

    ngOnInit(): void {
        this.companyCode = this.router.snapshot.params["code"];
        this.doSearch(0);
    }

    doSearch(pageInfo?: any): any {

        let param = {
            companyCode: this.companyCode,
            langCode: this.langCode,
            companyName: this.companyName,
            createDate: new Date(this.createDate),
            page: pageInfo ? pageInfo["page"] : this.page,
            size: pageInfo ? pageInfo["pageSize"] : this.pageSize
        }
        this.api.post(COMPANY_LANGUAGE_ENDPOINT.GET_COMPANY_LANGUAGE, param).subscribe((res) => {
            this.dataList = res.data["list"];
            this.totalItems = res.data["count"];
        })
    }

    addNew(): any {
        let param = {
            title: "Thêm mới thông tin ",
            companyCode: this.companyCode,
        }
        const dialog = this.dialog.open(CompanyLanguageDialogComponent, {
            width: '60%',
            data: param,
            disableClose:true
        })
        dialog.afterClosed().subscribe((res) => {
            if (res != 1 && res != undefined) {
                this.toast.showSuccess("Thông báo", "Thêm mới dữ liệu thành công.")
                this.doSearch(0);
            }
        })
    }

    doDetail(item: any): any {
        let param: object = {
            title: 'Thông tin công ty',
            companyLanguageId: item["id"],
            isView: true,
        };
        this.dialog.open(CompanyLanguageDialogComponent, {
            width: '60%',
            data: param,
            disableClose:true
        })
    }

    doDelete(item: any): any {

        let param: Object = {
            title: 'Xác nhận xóa',
            message: 'Bạn có muốn xóa thông tin Company Language <strong>' + item["companyCode"] + '</strong>?'
        };
        const dialogRef = this.dialog.open(DialogCommonComponent, {width: '40%', data: param, disableClose:true});
        dialogRef.afterClosed().subscribe(result => {
            if (result && result["rs"] === true) {
                let id = item["id"];
                this.api.get("companylanguage/deleteCompanyLanguage/" + id).subscribe((res) => {
                    this.loading = false;
                    if (res) {
                        this.toast.showSuccess('Thông báo', 'Xóa dữ liệu thành công.');
                        this.doSearch(0);
                    } else {
                        this.toast.showWarning('Thông báo', 'Xóa dữ liệu không thành công.');
                    }
                })
            }
        });
    }

    doUpdate(item: any): any {

        let param = {
            title: "Cập nhật dữ liệu ",
            companyLanguageId: item["id"],
            companyCode: this.companyCode,
            isView: false,
        }
        const dialog = this.dialog.open(CompanyLanguageDialogComponent, {
            width: '60%',
            data: param,
            disableClose:true
        })
        dialog.afterClosed().subscribe((res) => {
            if (res != 1 && res != undefined) {
                this.toast.showSuccess("Thông báo", "Cập nhật dữ liệu thành công.")
                this.doSearch(0);
            }
        })
    }
}
