import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import * as _ from 'lodash';
import { ImagePreviewComponent } from 'src/app/common/GUI/image-preview/image-preview.component';
import { FileUtils } from 'src/app/common/utils/file-utils';
import {
    ATTACH_FILE,
    LANGUAGE_ENDPOINT,
} from '../../../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../../../common/services/api/fetch-api.service';
import { ToastNotiService } from '../../../../../common/services/toastr/toast-noti.service';

@Component({
    selector: 'app-banner-dialog',
    templateUrl: './banner-dialog.component.html',
    styleUrls: ['./banner-dialog.component.scss'],
})
export class BannerDialogComponent implements OnInit {
    loading: boolean = false;
    title!: string;
    portalCode!: string;
    formType!: string;
    fileType: number = 0;
    lstLangByPortal: any = [];
    portalName!: string;
    lstFile: any = [];
    listImage: any = [];
    page: number = 0;
    pageSize: number = 10;
    langCode: string = 'VI';
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
        'video/mp4',
        'video/ogg',
    ];
    lstBanner: any = [
        { name: 'Banner', value: 0 },
        { name: 'Ảnh quảng cáo', value: 1 },
    ];
    groupName!: any;
    groupCode!: any;
    langName!: any;

    constructor(
        private dialogRef: MatDialogRef<BannerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private toast: ToastNotiService,
        private api: FetchApiService
    ) {}

    ngOnInit(): void {
        this.portalCode = this.dataInput['portalCode'];
        this.title = this.dataInput['title'];
        this.formType = this.dataInput['type'];
        this.lstLangByPortal = this.dataInput['lstLangByPortal'];
        this.portalCode = this.dataInput['portalCode'];
        this.portalName = this.dataInput['portalName'];
        this.onChangePortal(this.portalCode);
    }

    doSave() {
        if (this.lstFile.length == 0) {
            this.toast.showWarning(
                'Thông báo',
                'Vui lòng tải lên ảnh trước khi lưu.'
            );
            return;
        } else {
            this.uploadFile();
        }
    }

    uploadFile() {
        this.loading = true;
        let fd = new FormData();
        this.lstFile.forEach((file: any) => {
            fd.append('files', file);
        });
        fd.append('portalCode', this.portalCode);
        fd.append('langCode', this.langCode);
        fd.append('fileType', this.fileType == 0 ? '0' : '1');
        fd.append('approve', '1');
        this.api.uploadFile(ATTACH_FILE.UPLOADFILE_BANNER, fd).subscribe(
            (res) => {
                this.loading = false;
                if (res && res['data'] === 0) {
                    this.toast.showSuccess(
                        'Thông báo',
                        'Thêm mới thành công !'
                    );
                    this.doClose();
                }
            },
            (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }

    changeFile(event: any) {
        if (event) {
            let arrFile = event.target.files;
            for (let i = 0; i < arrFile.length; i++) {
                if (_.includes(this.acceptTypeImage, arrFile[i].type)) {
                    let fileObj = arrFile[i];
                    this.lstFile.push(fileObj);
                    let fileUtils = new FileUtils();
                    let img = {
                        name: fileObj['name'],
                        imgData: '',
                        fileContent: fileObj,
                    };
                    fileUtils
                        .convertFileToBase64(fileObj)
                        .subscribe((base64) => {
                            img['imgData'] = base64;
                        });
                    this.listImage.push(img);
                }
            }

            event.target.value = '';
        }
    }

    doPreview(item: any) {
        let params: object = {};
        if (item['imgData']) {
            params = {
                imgName: item.name,
                imgData: item.imgData,
                displayVideo: item.fileContent.type,
            };
        } else {
            params = {
                fileContent: item.pathStorage,
            };
        }

        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: params,
            disableClose: true,
        });
    }

    removeFile(index: any) {
        this.listImage.splice(index, 1);
        this.lstFile.splice(index, 1);
    }

    downloadFile(item: any) {
        const url = 'data:application/octet-stream;base64,' + item.pathStorage;
        const fileName = item.imgName;
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    doClose() {
        this.dialogRef.close();
    }

    onChangePortal(value: any) {
        if (value) {
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
}
