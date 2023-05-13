import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-validate',
    templateUrl: './dialog-validate.component.html',
    styleUrls: ['./dialog-validate.component.scss']
})
export class DialogValidateComponent implements OnInit {

    title!: String;
    message!: String;
    showConfirm: boolean = true;

    constructor(
        public dialogRef: MatDialogRef<DialogValidateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit(): void {
        this.title = this.data.title;
        this.message = this.data.message.replaceAll("\n", "<br>");
        if (this.data["showConfirm"] === false) {
            this.showConfirm = false;
        }
    }

    close(): void {
        this.dialogRef.close(1);
    }


}
