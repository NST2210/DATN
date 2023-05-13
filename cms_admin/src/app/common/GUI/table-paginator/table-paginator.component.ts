import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import * as _ from 'lodash';

@Component({
    selector: 'table-paginator',
    templateUrl: './table-paginator.component.html',
    styleUrls: ['./table-paginator.component.scss'],
})
export class TablePaginatorComponent implements OnInit {
    @Input() dataSource: any = [];
    @Input() tableColumns: any = [];
    @Input() tableAction?: any;
    @Input() totalItems: number = 0;
    @Input() showRadio?: boolean = false;
    @Input() page: number = 0;
    @Input() pageSize: number = 10;

    @Output() doChangePage: EventEmitter<any> = new EventEmitter();

    columnsView: any = [];
    displayedColumns: string[] = [];

    constructor() {}

    ngOnInit(): void {
        this.initTable();
    }

    initTable(): void {
        let cols: any = [];
        this.tableColumns.forEach((obj: any) => {
            if (!obj.options || obj.options.display !== true) {
                this.columnsView = [...this.columnsView, obj];
                obj['view'] = true;
            }
            cols = [...cols, obj];
        });
        this.tableColumns = _.cloneDeep(cols);
        let rs: any = ['no'];
        if (this.showRadio && this.showRadio === true) {
            rs.push('radioGroup');
        }
        if (this.tableAction) rs.push('func');
        rs = _.concat(
            rs,
            this.columnsView.map((col: any) => col.name)
        );
        this.displayedColumns = rs;
    }

    renderValue(obj: any, column: any, index: number): any {
        if (column && column.options) {
            let options = _.cloneDeep(column.options);
            if (options.customBodyRender) {
                let str = options.customBodyRender(
                    obj[column.name],
                    obj,
                    index
                );
                return str;
            }
        }
        return obj[column.name];
    }

    onChangePage(event: any) {
        this.pageSize = event.pageSize;
        this.page = event.pageIndex;
        let pageInfo = {
            page: event.pageIndex,
            pageSize: event.pageSize,
        };
        this.doChangePage.emit(pageInfo);
    }

    viewIconName(action: any, item: any) {
        if (action.customIcon) {
            return action.customIcon(item);
        } else {
            return action['icon'];
        }
    }

    viewTooltipName(action: any, item: any) {
        if (action.customTooltip) {
            return action.customTooltip(item);
        } else {
            return action['tooltip'];
        }
    }

    doClickAction(action: any, obj: any) {
        if (action.doAction) {
            action.doAction(obj);
        }
    }

    onChangeToggle(item: any, value: any) {
        if (value) {
            this.dataSource.forEach((obj: any) => {
                if (obj['userName'] === item['userName']) {
                    obj['checked'] = true;
                } else {
                    obj['checked'] = false;
                }
            });
        }
    }
}
