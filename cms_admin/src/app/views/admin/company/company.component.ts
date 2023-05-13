import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {ToastNotiService} from 'src/app/common/services/toastr/toast-noti.service';
import {CompanyDialogComponent} from 'src/app/views/admin/company/company-dialog/company-dialog.component';
import {DialogCommonComponent} from 'src/app/common/GUI/dialog-common/dialog-common.component';
import * as moment from 'moment';
import {EICON_TYPE} from './../../../common/enum/EType';
import {COMPANY_ENDPOINT} from 'src/app/common/enum/EApiUrl';

@Component({
    selector: 'app-company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

    dataList: any = [];
    codeCompany!: String;
    isActive!: number;
    page: number = 0;
    pageSize: number = 10;
    totalItems!: number;
    codeCompanyNew!: String;

    companyFormControl = new FormControl('', [Validators.required]);

    listCompany: any = [];

    columnsView: any = [];
    displayedColumns: string[] = [];

    tableColumns: any = [
        {
            name: 'code',
            label: 'Mã công ty',
        },
        {
            name: 'createdDate',
            label: 'Ngày tạo',
            options: {
                align: 'text-center',
                customBodyRender: (value: any) => {
                    return value ? moment(value).format('DD/MM/YYYY') : '';
                }
            },
        },
        {
            name: 'isActive',
            label: 'Tình trạng',
            options: {
                width: '20%',
                align: 'text-center',
                customBodyRender: (value: any, obj: any) => {
                    let strHtml = '<span';

                    if (value === 1) {
                        strHtml += ' class="status-success" ';
                    } else {
                        strHtml += ' class="status-error" ';
                    }

                    strHtml += '>' + obj['isActiveName'] + '</span>';

                    return strHtml;
                },
            },
        }
    ];

    tableAction: any = [

        {
            icon: 'fa fa-eye',
            iconType: EICON_TYPE.FONT_AWESOME,
            tooltip: 'Xem thông tin',
            doAction: (item: any) => {
                this.viewCompanyCode(item)
            },
        },
        {
            icon: 'cilPencil',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Sửa',
            doAction: (item: any) => {
                this.doUpdate(item)
            },
        },
        {
            icon: 'cilTrash',
            iconType: EICON_TYPE.CORE_UI,
            tooltip: 'Xóa',
            doAction: (item: any) => {
                this.doDelete(item);
            },
        },
    ];


    constructor(
        private api: FetchApiService,
        public dialog: MatDialog,
        private toast: ToastNotiService,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
        this.doSearch(0);
    }

    //tìm kiếm
    doSearch(pageInfo?: any): any {

        let param = {
            codeCompany: this.codeCompany,
            isActive: this.isActive,
            page: pageInfo ? pageInfo["page"] : this.page,
            size: pageInfo ? pageInfo["pageSize"] : this.pageSize
        }
        this.api.post(COMPANY_ENDPOINT.GET_COMPANY, param).subscribe((res) => {
            this.dataList = res.data["list"];
            this.totalItems = res.data.count;
        })
    }

    //thêm mới
    doCreate(): any {
        let param: Object = {
            title: 'Thông tin thêm mới',
        }
        const dialogRef = this.dialog.open(CompanyDialogComponent, {
            width: '60%',
            data: param,
            disableClose:true
        })
        dialogRef.afterClosed().subscribe((res) => {
            if (res != 1 && res != undefined) {
                this.toast.showSuccess("Thông báo", "Tạo mới thành công")
                this.doSearch(0);
            }
        })
    }

    //Update dữ liệu
    doUpdate(item: any) {
        let param: Object = {
            title: 'Cập nhật thông tin',
            CompanyId: item["id"],
            code: item["code"],
            isActive: item["isActive"]
        }
        const dialogRef = this.dialog.open(CompanyDialogComponent, {
            width: '60%',
            data: param,
            disableClose:true
        })
        dialogRef.afterClosed().subscribe((res) => {
            if (res != 1 && res != undefined) {
                this.toast.showSuccess("Thông báo", "Cập nhật thành công")
                this.doSearch(0);
            }
        })
    }

    //Xóa
    doDelete(item: any): any {
        let param: Object = {
            title: 'Xác nhận xóa',
            message: 'Bạn có muốn xóa thông tin công ty <strong>' + item["code"] + '</strong>?'
        };
        const dialogRef = this.dialog.open(DialogCommonComponent, {width: '40%', data: param, disableClose:true});
        dialogRef.afterClosed().subscribe(result => {
            if (result && result["rs"] === true) {
                let id = item["id"];
                this.api.get(COMPANY_ENDPOINT.DELETE + id).subscribe((res) => {
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

    viewCompanyCode(item: any) {
        this.router.navigate(['companyLanguage', {code: item.code}]);
    }

    //hủy
    close() {
        this.codeCompanyNew = "";
    }

    //phân trang
    onChangePage(event: any) {
        this.pageSize = event.pageSize;
        this.page = event.pageIndex;
        this.doSearch(0);
    }
}
