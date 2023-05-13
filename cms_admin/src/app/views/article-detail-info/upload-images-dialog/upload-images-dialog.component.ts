import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import * as _ from 'lodash';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { ImagePreviewComponent } from '../../../common/GUI/image-preview/image-preview.component';
import { FileUtils } from '../../../common/utils/file-utils';

@Component({
    selector: 'app-upload-images-dialog',
    templateUrl: './upload-images-dialog.component.html',
    styleUrls: ['./upload-images-dialog.component.scss'],
})
export class UploadImagesDialogComponent implements OnInit {
    @ViewChild('fileField') fileField: any;
    loading: boolean = false;
    title!: String;
    lstImgUpload: any = [];
    lstImgBefore: any = [];
    imgDisplay!: any;
    imgDisplayName!: string;
    imgIllustration!: number;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
        'image/jfif',
    ];
    isView: boolean = false;

    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<UploadImagesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private api: FetchApiService,
        private toast: ToastNotiService
    ) {}

    ngOnInit(): void {
        this.title = this.data['title'];
        this.lstImgUpload = this.data['lstImgUpload'];
        this.lstImgBefore = this.data['lstImgBefore'];
        this.isView = this.data['isView'];
    }

    changeFile(event: any) {
        if (event) {
            _.forEach(event, (e) => {
                if (!_.includes(this.acceptTypeImage, e.type)) {
                    this.toast.showWarning(
                        'Chỉ được upload file có định dạng ảnh!'
                    );
                    return;
                } else {
                    let fileUtils = new FileUtils();
                    fileUtils.convertFileToBase64(e).subscribe((base64) => {
                        let img: any = {
                            imgDisplay: base64,
                            imgDisplayName: e['name'],
                            imgDesc: '',
                            imgIllustration: '',
                        };
                        this.lstImgUpload.push(img);
                    });
                }
            });
        }
    }

    doUpload(type: string) {
        let lstImgBefore = _.map(this.data['lstImgBefore'], 'imgDisplayName');
        let lstFileName = _.map(this.lstImgUpload, 'imgDisplayName');
        let lstFinal = _.uniq(lstFileName);

        if (lstFinal.length !== lstFileName.length) {
            this.toast.showWarning(
                'Thông báo',
                'Không tải lên file trùng nhau'
            );
            return;
        }
        const duplicates = lstImgBefore.filter((item) =>
            lstFileName.includes(item)
        );

        if (duplicates.length > 0) {
            this.toast.showWarning(
                'Thông báo',
                'Không tải lên file trùng nhau'
            );
            return;
        }

        this.dialogRef.close({
            rs: true,
            lstImgUpload: this.lstImgUpload,
            type: type,
        });
    }

    close() {
        this.dialogRef.close({ rs: false, lstImgUpload: this.lstImgUpload });
    }

    onDelete(imgName: any, index: any) {
        this.lstImgUpload.splice(index, 1);
        this.fileField.nativeElement.value = '';
    }

    doPreview(item: any) {
        let params: object = {
            title: '',
            imgName: item.imgDisplayName,
            fileContent: item.imgDisplay,
            description: item.imgDesc,
        };

        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: params,
            disableClose: true,
        });
    }

    radioChange(item: any) {
        // this.lstImgUpload.find((obj: any) => obj.imgIllustration == 1).imgIllustration = 0;
        this.lstImgUpload.forEach((obj: any) => {
            if (obj.imgDisplayName == item.imgDisplayName) {
                obj.imgIllustration = 1;
            } else {
                obj.imgIllustration = 0;
            }
        });
    }
}
