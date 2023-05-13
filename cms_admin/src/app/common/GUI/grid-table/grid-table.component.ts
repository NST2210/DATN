import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import * as _ from 'lodash';

@Component({
    selector: 'grid-table',
    templateUrl: './grid-table.component.html',
    styleUrls: ['./grid-table.component.scss'],
})
export class GridTableComponent implements OnInit {
    @Input() dataSource: any = [];
    @Input() tableColumns: any = [];
    @Input() tableAction?: any;
    @Input() totalItems: number = 0;
    @Input() showCheckbox?: boolean = false;

    @Output() doChangePage: EventEmitter<any> = new EventEmitter();

    columnsView: any = [];
    displayedColumns: string[] = [];
    checkAll: boolean = false;

    page: number = 0;
    pageSize: number = 10;

    toppings = this._formBuilder.group({
        checkbox: false,
    });

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.initTable();
    }

    ngOnChanges() {
        if (this.showCheckbox) {
            this.checkAll = false;
        }
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
        if (this.showCheckbox && this.showCheckbox === true) {
            rs.push('checkbox');
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

    changeViewColumn(col: any, index: number): void {
        if (col.view === true) {
            this.columnsView.splice(index, 0, col);
        } else {
            this.columnsView = _.reject(this.columnsView, (obj) => {
                return obj.name === col.name;
            });
        }
        let rs: any = ['no', 'func'];
        rs = _.concat(
            rs,
            this.columnsView.map((col: any) => col.name)
        );
        this.displayedColumns = rs;
    }

    onChangePage(event: any) {
        this.checkAll = false;
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

    checkDisplay(action: any, item: any) {
        if (action.display) {
            return action.display(item);
        } else {
            return true;
        }
    }

    doClickAction(action: any, obj: any) {
        if (action.doAction) {
            action.doAction(obj);
        }
    }

    onCheckAll(ob: MatCheckboxChange) {
        if (ob && ob.checked === true) {
            this.dataSource.forEach((obj: any) => {
                obj['checked'] = true;
            });
        } else {
            this.checkAll = false;
            this.dataSource.forEach((obj: any) => {
                obj['checked'] = false;
            });
        }
    }

    onCheckItem(ob: MatCheckboxChange) {
        let itemCheck = _.filter(this.dataSource, (obj: any) => {
            return obj['checked'] === true;
        });
        if (itemCheck && itemCheck.length === this.dataSource.length) {
            this.checkAll = true;
        } else {
            this.checkAll = false;
        }
    }
}
