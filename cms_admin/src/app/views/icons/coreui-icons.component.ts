import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IconSetService} from '@coreui/icons-angular';
import {brandSet, flagSet, freeSet} from '@coreui/icons';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    templateUrl: 'coreui-icons.component.html',
    providers: [IconSetService],
})
export class CoreUIIconsComponent implements OnInit {
    title!: string;
    iconCurrent!: string;
    icons!: [string, string[]][];

    constructor(
        private route: ActivatedRoute,
        public iconSet: IconSetService,
        private dialogRef: MatDialogRef<CoreUIIconsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        iconSet.icons = {...freeSet, ...brandSet, ...flagSet};
    }

    ngOnInit() {
        let prefix = 'cil';
        this.title = this.title = this.data["title"];
        this.iconCurrent = this.data["iconCurrent"];
        this.icons = this.getIconsView(prefix);
    }

    toKebabCase(str: string) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    getIconsView(prefix: string) {
        return Object.entries(this.iconSet.icons).filter((icon) => {
            return icon[0].startsWith(prefix);
        });
    }

    doChoiceIcon(iconName: any) {
        this.dialogRef.close(iconName);
    }

    close(): void {
        this.dialogRef.close();
    }
}
