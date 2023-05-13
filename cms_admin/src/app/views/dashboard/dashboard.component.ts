import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import * as _ from 'lodash';
import {
    LANGUAGE_ENDPOINT,
    PORTAL_INFO_ENDPOINT,
    REPORT_ENDPOINT
} from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { DATE_CONSTANT } from 'src/app/common/shared/constants/date.constant';
import { DashboardTotalModel } from '../../common/model/DashboardTotalModel';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

    loading: boolean = false;
    lstPortal: any = [];
    lstLangByPortal: any = [];
    portalCode: string='VDSS';
    langCode: string = 'VI';
    pieCharData: any = [];
    fromDate?: String;
    toDate?: String;
    DATE_CONSTANT = DATE_CONSTANT;
    dashboardTotal: DashboardTotalModel = new DashboardTotalModel();
    @Output() someString: EventEmitter<string> = new EventEmitter();

    mask = {
        guide: true,
        showMask: true,
        mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/],
    };

    constructor(
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {
    }

    ngOnInit(): void {
        this.getAllPortal();
        if (this.portalCode) {
            this.onChangePortal(this.portalCode);
        }
    }

    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {},
            y: {},
        },
        plugins: {
            legend: {
                display: true,
            },
        },
    };
    public barChartType: ChartType = 'bar';
    public barChartData: ChartData<'bar'> = {
        labels: [] ,
        datasets: [],
    };

    getAllPortal() {
        this.loading = true;
        this.api.get(PORTAL_INFO_ENDPOINT.GET_ALL_ACTIVE).subscribe(
            (res) => {
                this.lstPortal = res['data'];
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }

    onChangePortal(value: any) {
        if (value) {
            this.getDataTotalDashboard();
            this.getDataBarChar();
            this.getDataPieChar();
            this.loading = true;
            this.api
                .get(LANGUAGE_ENDPOINT.GET_LANG_BY_PORTAL, {
                    portalCode: value,
                })
                .subscribe(
                    (res) => {
                        this.lstLangByPortal = res['data'];
                        this.loading = false;
                    },
                    () => {
                        this.loading = false;
                    }
                );
        }
    }

    onChangeFromDate(fromDate: any) {
        if (fromDate) {
            this.fromDate = fromDate;
            this.getDataTotalDashboard();
            this.getDataBarChar();
            this.getDataPieChar();
        }
    }

    onChangeToDate(toDate: any) {
        if (toDate) {
            this.toDate = toDate;
            this.getDataTotalDashboard();
            this.getDataBarChar();
            this.getDataPieChar();
        }
    }

    onChangeLang() {
        this.getDataTotalDashboard();
        this.getDataBarChar();
        this.getDataPieChar();
    }

    getDataTotalDashboard() {
        this.loading = true;
        let param = {
            portalCode: this.portalCode,
            langCode: this.langCode ? this.langCode : '',
            fromDate: this.fromDate ? this.fromDate : null,
            toDate: this.toDate ? this.toDate : null,
        };
        this.api.post(REPORT_ENDPOINT.DATA_DASHBOARD_TOTAL, param).subscribe(
            (res) => {
                this.loading = false;
                this.dashboardTotal = res['data'];
            },
            () => {
                this.loading = false;
            }
        );
    }

    getDataBarChar() {
        this.loading = true;
        let param = {
            portalCode: this.portalCode,
            langCode: this.langCode ? this.langCode : '',
            fromDate: this.fromDate ? this.fromDate : null,
            toDate: this.toDate ? this.toDate : null,
        };
        this.api.post(REPORT_ENDPOINT.DATA_BAR_CHAR, param).subscribe(
            (res) => {
                this.loading = false;
                this.barChartData = _.cloneDeep(res['data']);
            },
            () => {
                this.loading = false;
            }
        );
    }

    getDataPieChar() {
        this.loading = true;
        let param = {
            portalCode: this.portalCode,
            langCode: this.langCode ? this.langCode : '',
            fromDate: this.fromDate ? this.fromDate : null,
            toDate: this.toDate ? this.toDate : null,
        };
        this.api.post(REPORT_ENDPOINT.DATA_PIE_CHAR, param).subscribe(
            (res) => {
                this.loading = false;
                this.pieCharData = _.cloneDeep(res['data']);
            },
            () => {
                this.loading = false;
            }
        );
    }

    formatViewNumber(value: number) {
        if (value) return value;
        else return 0;
    }

}
