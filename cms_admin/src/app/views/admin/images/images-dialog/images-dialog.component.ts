import {
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import * as _ from 'lodash';
import {
    ARTICLE_GROUP,
    ATTACH_FILE,
    IMG_VIDEOS,
} from 'src/app/common/enum/EApiUrl';
import { DialogCommonComponent } from 'src/app/common/GUI/dialog-common/dialog-common.component';
import { ImagePreviewComponent } from 'src/app/common/GUI/image-preview/image-preview.component';
import { FetchApiService } from 'src/app/common/services/api/fetch-api.service';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { FileUtils } from 'src/app/common/utils/file-utils';
import { ImagesVideo } from '../../../../common/model/ImagesVideoModel';
import { ImagesComponent } from '../images.component';

@Component({
    selector: 'app-images-dialog',
    templateUrl: './images-dialog.component.html',
    styleUrls: ['./images-dialog.component.scss'],
})
export class ImagesDialogComponent implements OnInit {
    @ViewChild('videoPlayer', { static: false }) videoplayer!: ElementRef;

    isUpdate: number = 1; //để khi cập nhật nhiều bản ghi chỉ view 1 lần thông báo thành công
    loading: boolean = false;
    title!: string;
    form!: FormGroup;
    formType!: string;
    tabSelected: number = 0;
    page: number = 0;
    pageSize: number = 10;
    lstLangByPortal: any = [];
    portalCode!: string;
    portalName!: string;
    langCode!: string;
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
    listImageVideo: any = [];
    lstArticleGroup: any = [];
    articleGroup!: string;
    articleGroupName!: string;
    lstFile: any = [];
    description!: string;
    lstdataDetail: any = [];
    totalItems: number = 0;
    totalItemsImg: number = 0;
    totalItemsVideo: number = 0;
    listDataImg: any = [];
    listDataVideo: any = [];
    groupName!: any;
    groupCode!: any;
    langName!: any;
    lstImgOld!: any;
    lstVideoOld!: any;
    lstDataUpdate!: any;

    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ImagesComponent>,
        @Inject(MAT_DIALOG_DATA) public dataInput: any,
        private api: FetchApiService,
        private toast: ToastNotiService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.title = this.dataInput['title'];
        this.formType = this.dataInput['formType'];
        this.portalCode = this.dataInput['portalCode'];
        this.portalName = this.dataInput['portalName'];
        this.lstLangByPortal = this.dataInput['lstLangByPortal'];
        if (this.dataInput['item']) {
            this.langCode = this.dataInput['item']['langCode'];
            this.langName = this.dataInput['item']['langName'];
            this.groupCode = this.dataInput['item']['groupCode'];
            this.groupName = this.dataInput['item']['content'];
            this.updateForm(this.dataInput.item);
        }
        this.doSearchDataImg();
        this.doSearchDataVideo();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            portalCode: [null],
            langCode: [null, [Validators.required]],
            articleGroupCode: [null, [Validators.required]],
            description: [
                '',
                [Validators.required, Validators.maxLength(1000)],
            ],
        });
    }

    updateForm(item: ImagesVideo) {
        if (!this.form) this.buildForm();
        this.form.patchValue({
            portalCode: item ? item['portalCode'] : null,
            langCode: item ? item['langCode'] : null,
            articleGroupCode: item ? item['groupCode'] : null,
        });
        this.form.controls['portalCode'].disable();
        this.form.controls['langCode'].disable();
        this.form.controls['articleGroupCode'].disable();
    }

    onChangeLang(value: any) {
        if (value) {
            this.loading = true;
            this.api
                .get(ARTICLE_GROUP.GET_BY_PORTAL, {
                    portalCode: this.portalCode,
                    langCode: value,
                })
                .subscribe(
                    (res) => {
                        this.loading = false;
                        this.lstArticleGroup = res['data'];
                    },
                    () => {
                        this.loading = false;
                    }
                );
        } else {
            this.lstArticleGroup = [];
        }
    }

    changeFile(event: any) {
        if (event) {
            let arrFile = event.target.files;
            for (let i = 0; i < arrFile.length; i++) {
                if (!_.includes(this.acceptTypeImage, arrFile[i].type)) {
                    this.toast.showWarning(
                        'Chỉ được upload file có định dạng ảnh hoặc video!'
                    );
                    return;
                } else if (_.includes(this.acceptTypeImage, arrFile[i].type)) {
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
                    this.listImageVideo.push(img);
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
        this.listImageVideo.splice(index, 1);
        this.lstFile.splice(index, 1);
    }

    doSave() {
        if (this.lstFile.length > 0) {
            if (this.form.invalid) {
                this.toast.showWarning(
                    'Thông báo',
                    'Vui lòng kiểm tra thông tin thông tin !'
                );
                return;
            }
            this.uploadFile();
        }
        if (this.formType === 'update') {
            this.updateDescriptionAlotsOfImgVideo();
            this.dialogRef.close();
        }
    }

    // search data img
    doSearchDataImg(pageInfo?: any) {
        this.loading = true;
        if (pageInfo) {
            this.page = pageInfo['pageIndex'];
            this.pageSize = pageInfo['pageSize'];
        }
        let param = {
            portalCode: this.portalCode,
            listGroupCode: [],
            articleGroupCode: this.form.controls['articleGroupCode'].value,
            langCode: this.langCode,
            page: this.page,
            size: this.pageSize,
        };
        this.api.post(IMG_VIDEOS.SEARCH_IMG, param).subscribe(
            (res) => {
                this.listDataImg = res.data.list;
                this.lstImgOld = _.cloneDeep(this.listDataImg);
                this.totalItemsImg = res.data['count'];
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }
    // search data video
    doSearchDataVideo(pageInfo?: any) {
        this.loading = true;
        if (pageInfo) {
            this.page = pageInfo['pageIndex'];
            this.pageSize = pageInfo['pageSize'];
        }
        let param = {
            portalCode: this.portalCode,
            articleGroupCode: this.form.controls['articleGroupCode'].value,
            listGroupCode: [],
            langCode: this.langCode,
            page: this.page,
            size: this.pageSize,
        };
        this.api.post(IMG_VIDEOS.SEARCH_VIDEO, param).subscribe(
            (res) => {
                this.listDataVideo = res.data.list;
                this.lstVideoOld = _.cloneDeep(this.listDataVideo);
                this.totalItemsVideo = res.data['count'];
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }
    //xóa ảnh or video
    doDelete(item: any) {
        let params: Object = {
            title: 'Xác nhận',
            message:
                item.fileType == 1
                    ? 'Bạn có chắc chắn muốn xóa ảnh này'
                    : 'Bạn có chắc chắn xóa video này',
        };
        this.dialog
            .open(DialogCommonComponent, {
                width: '25%',
                data: params,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result && result['rs'] === true) {
                    this.loading = true;
                    this.api
                        .post(IMG_VIDEOS.DELETE, null, {
                            id: item['id'],
                            changeStatus: 2,
                        })
                        .subscribe(
                            (res) => {
                                this.loading = false;
                                if (res.data === true) {
                                    this.toast.showSuccess(
                                        'Thông báo',
                                        'Xóa thành công!'
                                    );
                                    if (item.fileType === 1) {
                                        this.doSearchDataImg();
                                    } else {
                                        this.doSearchDataVideo();
                                    }
                                }
                            },
                            (error) => {
                                this.loading = false;
                                this.toast.showError(
                                    error.message ? error.message : error
                                );
                            }
                        );
                }
            });
    }

    doChangeStatus(item: any) {
        this.loading = true;
        let changeStatus: number;
        if (item.isActive === 1) {
            changeStatus = 0;
        } else {
            changeStatus = 1;
        }
        this.api
            .post(IMG_VIDEOS.DELETE, null, {
                id: item['id'],
                changeStatus: changeStatus,
            })
            .subscribe(
                (res) => {
                    this.loading = false;
                    if (res.data === true) {
                        this.toast.showSuccess(
                            'Thông báo',
                            'Cập nhật trạng thái thành công!'
                        );
                        if (item.fileType === 1) {
                            this.doSearchDataImg();
                        } else {
                            this.doSearchDataVideo();
                        }
                    }
                },
                (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                }
            );
    }

    doUpdateDescribe(item: any) {
        this.loading = true;
        this.api
            .post(IMG_VIDEOS.UPDATE_DESCRIPTION, {
                id: item['id'],
                description: item['description'],
            })
            .subscribe(
                (res) => {
                    this.loading = false;
                    if (res.data && this.isUpdate == 1) {
                        this.toast.showSuccess(
                            'Thông báo',
                            'Cập nhật mô tả thành công!'
                        );
                        if (item.fileType === 1) {
                            this.doSearchDataImg();
                        } else {
                            this.doSearchDataVideo();
                        }
                    }
                },
                (error) => {
                    this.loading = false;
                    this.toast.showError(error.message ? error.message : error);
                }
            );
    }

    doClose() {
        this.dialogRef.close();
    }

    toggleVideo() {
        this.videoplayer.nativeElement.play();
    }

    uploadFile() {
        this.loading = true;
        let fd = new FormData();
        this.lstFile.forEach((file: any) => {
            fd.append('files', file);
            if (
                file.type === 'image/jpeg' ||
                file.type === 'image/png' ||
                file.type === 'image/jpg'
            ) {
                fd.append('fileType', '1');
            } else {
                fd.append('fileType', '2');
            }
        });
        fd.append('portalCode', this.portalCode);
        fd.append('langCode', this.form['controls']['langCode'].value);
        fd.append('description', this.form['controls']['description'].value);
        fd.append(
            'articleGroup',
            this.form['controls']['articleGroupCode'].value
        );
        fd.append('approve', '1');
        this.api.uploadFile(ATTACH_FILE.UPLOAD, fd).subscribe(
            (res) => {
                this.loading = false;
                if (res && res['data'] === 0) {
                    this.toast.showSuccess('Thông báo', 'Cập nhật thành công!');
                }
            },
            (error) => {
                this.loading = false;
                this.toast.showError(error.message ? error.message : error);
            }
        );
    }
    //download file
    downloadFile(item: any) {
        const url = 'data:application/octet-stream;base64,' + item.pathStorage;
        const fileName = item.imgName;
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    updateDescriptionAlotsOfImgVideo() {
        var listDataImgUpdate = _.differenceWith(
            this.listDataImg,
            this.lstImgOld,
            _.isEqual
        );
        var listDataVideoUpdate = _.differenceWith(
            this.listDataVideo,
            this.lstVideoOld,
            _.isEqual
        );
        if (listDataImgUpdate && listDataImgUpdate.length > 0) {
            this.lstDataUpdate = listDataImgUpdate;
        } else {
            this.lstDataUpdate = listDataVideoUpdate;
        }
        this.api
            .post(
                IMG_VIDEOS.UPDATE_DESCRIPTION_ALOTSOF_IMGVIDEO,
                this.lstDataUpdate
            )
            .subscribe(
                (res) => {
                    if (res.data) {
                        this.loading = false;
                        if (this.lstDataUpdate > 1) {
                            this.toast.showSuccess(
                                'Cập nhật mô tả ' +
                                    this.lstDataUpdate.length +
                                    ' Hình ảnh/Video thành công!'
                            );
                        }
                    } else {
                        this.loading = false;
                        this.toast.showWarning(
                            'Cập nhật mô tả ' +
                                this.lstDataUpdate.length +
                                ' Hình ảnh/Video không thành công!'
                        );
                    }
                },
                (error) => {
                    this.toast.showError(error.message ? error.message : error);
                }
            );
    }
}
