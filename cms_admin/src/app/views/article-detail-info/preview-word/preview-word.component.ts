import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'app-preview-word',
    templateUrl: './preview-word.component.html',
    styleUrls: ['./preview-word.component.scss']
})
export class PreviewWordComponent implements OnInit {
    loading: boolean = false;
    title!: String;
    doc!: any;

    constructor(
        private dialogRef: MatDialogRef<PreviewWordComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
    }

    ngOnInit(): void {
        this.title = this.data["title"];
        this.doc = this.data['doc'];
    }

    close() {
        this.dialogRef.close();
    }


}
