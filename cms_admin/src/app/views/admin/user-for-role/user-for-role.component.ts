import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FetchApiService} from 'src/app/common/services/api/fetch-api.service';
import {USERS_ENDPOINT} from 'src/app/common/enum/EApiUrl';
import * as _ from "lodash";

@Component({
    selector: 'app-user-for-role',
    templateUrl: './user-for-role.component.html',
    styleUrls: ['./user-for-role.component.scss']
})
export class UserForRoleComponent implements OnInit {

    title!: string;
    dataList: any = [];

    constructor(
        private dialogRef: MatDialogRef<UserForRoleComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private api: FetchApiService
    ) {
    }

    ngOnInit(): void {
        this.title = this.data["title"];
        this.getUserForRole();
    }

    getUserForRole() {
        this.api.get(USERS_ENDPOINT.USER_ROLE_INFO, {roleCode: 'abc'}).subscribe((res) => {
            this.doAnalysisData(res["data"]);
        }, () => {
        });
    }

    doAnalysisData(data: any) {
        var result = data.map((obj: any) => {
            let container = {
                name: obj["companyCode"]
            };

            return container;
        });

        let lstCompany = _.uniqBy(result, 'name');
        lstCompany.forEach((item: any) => {
            //get child
            let childs = _.filter(data, (obj: any) => {
                return obj["companyCode"] === item["name"];
            });
            if (childs) {
                let rsChild = childs.map((chld: any) => {
                    let container = {
                        id: chld["userId"],
                        name: chld["userName"]
                    };
                    return container;
                });
                item["children"] = _.cloneDeep(rsChild);
            }

        });
        this.dataList = _.cloneDeep(lstCompany);
    }

    close(): void {
        this.dialogRef.close(1);
    }
}
