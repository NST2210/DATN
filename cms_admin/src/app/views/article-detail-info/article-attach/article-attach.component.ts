import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import * as _ from 'lodash';
import { ARTICLE_DETAIL, UTILS } from 'src/app/common/enum/EApiUrl';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { FileUtils } from 'src/app/common/utils/file-utils';
import { ImagePreviewComponent } from '../../../common/GUI/image-preview/image-preview.component';

@Component({
    selector: 'app-article-attach',
    templateUrl: './article-attach.component.html',
    styleUrls: ['./article-attach.component.scss'],
})
export class ArticleAttachComponent implements OnInit {
    @ViewChild('fileField') fileField: any;
    loading: boolean = false;
    title!: string;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
        'image/jfif',
    ];

    lstAttach: any = [];
    fileWordUploadContent!: string;
    fileDetailContent!: any;
    isDisplayWord: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<ArticleAttachComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private toast: ToastNotiService,
        private api: FetchApiService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.title = this.data['title'];
        this.lstAttach = this.data['articleImgs'];

        if (this.data['wordContent']) {
            this.fileWordUploadContent = this.data['wordContent'];
        }
    }

    changeFileImg(event: any) {
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
                        let fileAttach: any = {
                            fileContent: base64,
                            fileName: e['name'],
                            fileType: 1,
                        };
                        this.lstAttach.push(fileAttach);
                    });
                }
            });
        }
    }

    changeFileOriginImport(event: any) {
        if (event && event[0]) {
            var n =
                event[0].name.lastIndexOf('doc') ||
                event[0].name.lastIndexOf('docx');

            if (n != -1) {
                //remove file old
                this.lstAttach = _.reject(this.lstAttach, (obj) => {
                    return obj['fileType'] === 0;
                });

                let fileUtils = new FileUtils();
                fileUtils.convertFileToBase64(event[0]).subscribe((base64) => {
                    let fileAttach: any = {
                        fileContent: base64,
                        fileName: event[0]['name'],
                        fileType: 0,
                    };
                    this.lstAttach.push(fileAttach);
                });
            } else {
                this.toast.showWarning(
                    'Chỉ được upload file có định dạng .doc, .docx!'
                );
                return;
            }
        }
    }

    changeFileImport(event: any) {
        if (event && event[0]) {
            var n =
                event[0].name.lastIndexOf('doc') ||
                event[0].name.lastIndexOf('docx');
            if (n != -1) {
                this.loading = true;
                let data = new FormData();
                data.append('file', event[0]);

                //remove file old
                this.lstAttach = _.reject(this.lstAttach, (obj) => {
                    return obj['fileType'] === 2;
                });

                this.api.uploadFile(UTILS.WORD_TO_HTML, data).subscribe(
                    (res) => {
                        this.loading = false;
                        this.fileWordUploadContent = res['data'];
                        let fileUtils = new FileUtils();
                        fileUtils
                            .convertFileToBase64(event[0])
                            .subscribe((base64) => {
                                let fileAttach: any = {
                                    fileContent: base64,
                                    fileName: event[0]['name'],
                                    fileType: 2,
                                };
                                this.lstAttach.push(fileAttach);
                            });
                    },
                    () => {
                        this.loading = false;
                    }
                );
            } else {
                this.toast.showWarning(
                    'Chỉ được upload file có định dạng .doc, .docx!'
                );
                return;
            }
        }
    }

    doSave() {
        let data = {
            articleContent: this.fileWordUploadContent,
            articleImgs: this.lstAttach,
        };

        this.dialogRef.close(data);
    }

    fillerDataImg(type: number) {
        // this.lstAttach.map()
        // if (this.lstAttach && this.lstAttach.length > 0) {
        //     this.lstAttach.map((obj: any, index: number) => {
        //         obj.index = index;
        //     });

        // }

        return _.filter(this.lstAttach, (obj, index) => {
            obj.index = index;
            return obj['fileType'] === type;
        });
    }

    radioChange(item: any) {
        this.lstAttach.forEach((obj: any) => {
            if (obj.fileName == item.fileName) {
                obj.isChoice = 1;
            } else {
                obj.isChoice = 0;
            }
        });
    }

    onDelete(item: any) {
        this.lstAttach.splice(item.index, 1);
        this.fileField.nativeElement.value = '';
        // console.log('listAttach', this.lstAttach);
    }

    doPreview(item: any) {
        let params: object = {
            title: 'Xem trước',
            fileContent: item['fileContent'],
            description: item['description'],
        };

        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: params,
            disableClose: true,
        });
    }

    doViewWord(item: any) {
        // this.isDisplayWord = false;
        // if (item['fileContent']) {
        //     this.fileDetailContent = this._base64ToArrayBuffer(
        //         item['fileContent']
        //     );
        //     this.isDisplayWord = true;
        // }
        const byteCharacters = atob(item['fileContent']);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
            type: 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', item['fileName']);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    _base64ToArrayBuffer(base64: any) {
        var binary_string = base64.replace(/\\n/g, '');
        binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    removeFileOrg(item: any) {
        // console.log('item', item);
        // let index = _.findIndex(this.lstAttach, function (obj: any) { return obj.fileType == item.fileType; });
        this.lstAttach.splice(item.index, 1);
    }
}
