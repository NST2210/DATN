import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import * as _ from 'lodash';

interface TreeInfo {
  url:string;
  iconName:string;
  code:string;
  id: number;
  parentId: number;
  name: string;
  children?: TreeInfo[];
}

/** Flat node with expandable and level information */
interface FlatNode {
  id: number;
  url:string;
  iconName:string;
  code:string;
  parentId: number;
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss'],
})
export class TreeViewComponent implements OnInit {
  @Input() dataList: any = [];
  @Input() showCheckbox: boolean = false;
  @Output() doChildClick: EventEmitter<any> = new EventEmitter();

  private _transformer = (node: TreeInfo, level: number) => {
    return {
      id: node.id,
      url:node.url,
      iconName:node.iconName,
      code:node.code,
      parentId: node.parentId,
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  hasChild = (_: number, node: FlatNode) => node.expandable;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges() {
    if (this.dataList) {
      if (this.dataList) {
        this.dataSource.data = this.dataList;
      }
      if (this.showCheckbox) {
        this.showCheckbox = this.showCheckbox;
      }
    }
  }

  doClickItem(item: any) {
    this.doChildClick.emit(item);
  }

  doChangeChkItem(item: any) {
    let itemIndex:number = 0;
    if(item['level'] === 1){
      itemIndex = _.findIndex(this.dataList, (obj: any) => {
        return obj['id'] === item['parentId'];
      });
    }else{
      itemIndex = _.findIndex(this.dataList, (obj: any) => {
        return obj['id'] === item['id'];
      });
    }


    if (item['level'] === 1) {
      //tim trong list con
      let childs = this.dataList[itemIndex]["children"];
      let itemIndexChild = _.findIndex(childs, (child: any) => {
        return child['id'] === item['id'];
      });
      this.dataList[itemIndex]["children"][itemIndexChild]["choice"] = _.cloneDeep(item['choice']);
    }else{
      this.dataList[itemIndex]["choice"] = _.cloneDeep(item['choice']);
    }
  }
}
