import {
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
    selector: 'app-image-preview',
    templateUrl: './image-preview.component.html',
    styleUrls: ['./image-preview.component.scss'],
})
export class ImagePreviewComponent implements OnInit {
    @ViewChild('videoPlayer', { static: false }) videoplayer!: ElementRef;
    loading: boolean = false;
    title!: string;
    imgName!: string;

    constructor(
        private dialogRef: MatDialogRef<ImagePreviewComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any
    ) {
        this.title = this.dataInput['title'];
    }

    ngOnInit(): void {}

    doClose(): any {
        this.dialogRef.close();
    }
}
