import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'pie-char',
    templateUrl: './pie-char.component.html',
    styleUrls: ['./pie-char.component.scss'],
})
export class PieCharComponent implements OnInit {
    @Input() pieCharData: any = [];

    @ViewChild(BaseChartDirective) pieChart: BaseChartDirective | undefined;

    //pie chart
    public pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                
            }
        },
    };
    public pieChartData: ChartData<'pie', number[], string | string[]> = {
        labels: ['Tạo nháp', 'Chờ duyệt', 'Duyệt', 'Từ chối', 'Xuất bản'],
        datasets: [
            {
                data: [],
                backgroundColor: ['#f0ad4e', '#5bc0de', '#39f','#eb2226','#5cb85c']
            },
        ],
    };
    

    public pieChartType: ChartType = 'pie';

    constructor() {}

    ngOnInit(): void {}

    ngOnChanges() {
        if (this.pieCharData) {
            this.pieChartData.datasets[0].data = this.pieCharData;
            this.pieChart?.update();
        }
    }
}
