import { PortalLangDetailModel } from './../../../../../common/model/PortalLangDetailModel';
import { Component, Input, OnInit } from '@angular/core';
import { FileUtils } from 'src/app/common/utils/file-utils';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { LanguagePortalModel } from 'src/app/common/model/LanguagePortalModel';
import * as _ from 'lodash';
import { ToastNotiService } from 'src/app/common/services/toastr/toast-noti.service';
import { MatDialog } from '@angular/material/dialog';
import { ImagePreviewComponent } from '../../../../../common/GUI/image-preview/image-preview.component';
import Adapter from 'src/app/common/enum/ckeditorAdapter';

@Component({
    selector: 'portal-footer',
    templateUrl: './portal-footer.component.html',
    styleUrls: ['./portal-footer.component.scss'],
})
export class PortalFooterComponent {
    @Input() portalInfo: any;
    @Input() langItem: LanguagePortalModel = new LanguagePortalModel();
    @Input() footerDetail: PortalLangDetailModel = new PortalLangDetailModel();

    loading: boolean = false;
    Editor = DecoupledEditor;
    acceptTypeImage: string[] = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/pdf',
        'image/psd',
    ];

    constructor(private toast: ToastNotiService, public dialog: MatDialog) {}

    changeFile(event: any, type: string) {
        if (event && event[0]) {
            if (!_.includes(this.acceptTypeImage, event[0].type)) {
                this.toast.showWarning(
                    'Chỉ được upload file có định dạng ảnh!'
                );
                return;
            } else {
                let fileUtils = new FileUtils();
                fileUtils.convertFileToBase64(event[0]).subscribe((base64) => {
                    if (type === 'default') {
                        this.footerDetail.logo = base64;
                        this.footerDetail.logoName = event[0].name;
                    } else if (type === 'scroll') {
                        this.footerDetail.logoScroll = base64;
                        this.footerDetail.logoScrollName = event[0].name;
                    }
                });
            }
        }
    }

    removeFile(type: string) {
        if (type === 'default') {
            this.footerDetail.logo = '';
        } else if (type === 'scroll') {
            this.footerDetail.logoScroll = '';
        }
    }

    doUploadDialog(type: string) {
        let param: object = {};
        if (type === 'default') {
            param = {
                loading: false,
                fileContent: this.footerDetail.logo,
            };
        } else if (type === 'scroll') {
            param = {
                loading: false,
                fileContent: this.footerDetail.logoScroll,
            };
        }
        this.dialog.open(ImagePreviewComponent, {
            width: '50%',
            data: param,
            disableClose: true,
        });
    }

    onReady(editor: any) {
        // editor.plugins.get('FileRepository').createUploadAdapter = function (
        //     loader: any
        // ) {
        //     return new UploadAdapter(loader);
        // };
        const toolbarElement = editor.ui.view.toolbar.element;

        toolbarElement.style.position = 'sticky';
        toolbarElement.style.top = '-14px';
        toolbarElement.style.zIndex = '100';
        editor.plugins.get('FileRepository').createUploadAdapter = (
            loader: any
        ) => {
            return new Adapter(loader, editor.config);
        };

        if (editor.model.schema.isRegistered('image')) {
            editor.model.schema.extend('image', {
                allowAttributes: 'blockIndent',
            });
        }

        editor.ui
            .getEditableElement()
            .parentElement.insertBefore(
                editor.ui.view.toolbar.element,
                editor.ui.getEditableElement()
            );
    }

    config = {
        toolbar: {
            items: [
                'heading',
                '|',
                'fontfamily',
                'fontsize',
                'alignment',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'bold',
                'italic',
                'strikethrough',
                'underline',
                'subscript',
                'superscript',
                '|',
                'link',
                '|',
                'outdent',
                'indent',
                '|',
                'bulletedList',
                '-',
                'numberedList',
                'todoList',
                '|',
                'code',
                'codeBlock',
                '|',
                'insertTable',
                '|',
                'imageUpload',
                'blockQuote',
                '|',
                'todoList',
                'undo',
                'redo',
            ],
            shouldNotGroupWhenFull: true,
        },
        fontSize: {
            options: [9, 11, 13, 15, 17, 19, 21],
        },
        image: {
            // Configure the available styles.
            styles: ['alignLeft', 'alignCenter', 'alignRight'],

            // Configure the available image resize options.
            resizeOptions: [
                {
                    name: 'resizeImage:original',
                    label: 'Original',
                    value: null,
                },
                {
                    name: 'resizeImage:50',
                    label: '25%',
                    value: '25',
                },
                {
                    name: 'resizeImage:50',
                    label: '50%',
                    value: '50',
                },
                {
                    name: 'resizeImage:75',
                    label: '75%',
                    value: '75',
                },
            ],

            // You need to configure the image toolbar, too, so it shows the new style
            // buttons as well as the resize buttons.
            toolbar: [
                'imageStyle:alignLeft',
                'imageStyle:alignCenter',
                'imageStyle:alignRight',
                '|',
                'ImageResize',
                '|',
                'imageTextAlternative',
            ],
        },
        // simpleUpload: {
        //    The URL that the images are uploaded to.
        // uploadUrl: 'http://localhost:52536/api/Image/ImageUpload',

        //   Enable the XMLHttpRequest.withCredentials property.

        //},

        language: 'en',
    };


    // onReady(editor: any) {
    //     editor.ui
    //         .getEditableElement()
    //         .parentElement.insertBefore(
    //             editor.ui.view.toolbar.element,
    //             editor.ui.getEditableElement()
    //         );
    // }
}
