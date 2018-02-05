import React, { Component } from 'react';
import { Strings } from '../modules/strings';
import { MessageHandler } from '../handlers/message.handler';
import { ProgressBarHandler } from '../handlers/progressbar.handler'
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import { Form } from '../modules/index';
import ImagePicker from 'react-native-image-picker';
import { inject } from 'mobx-react';
import { Messages, Progress } from './index';
import RNFS from 'react-native-fs';
import { SlideinMenu } from '../components/Menus/slidein-menu.comp';
import { iconNames } from '../styles/common';

@inject("strings")
export class FileHandler extends Component<any, any>
{
    private strings: Strings;
    private messageHandler: MessageHandler;
    private progressBarHandler: ProgressBarHandler;

    form: Form;
    afterUploadFunc: Function;
    isUploadCanceled: boolean;

    slideinMenu: SlideinMenu;

    constructor(props)
    {
        super(props);
        this.strings = this.props.strings;

        this.isUploadCanceled = false;
    }
    componentWillMount()
    {
        this.props.onRef(this);
    }
    componentWillUnmount()
    {
        this.props.onRef(undefined)
    }
    componentDidMount()
    {
        this.messageHandler = Messages;
        this.progressBarHandler = Progress;
    }

    openPicker(form: Form, afterUploadFunc: Function)
    {
        this.form = form;
        this.afterUploadFunc = afterUploadFunc;
        this.slideinMenu.open();
    }
    closePicker()
    {
        this.slideinMenu.close();
        return true;
    }
    openDocumentPicker = () =>
    {
        this.closePicker();
        DocumentPicker.show({ filetype: [DocumentPickerUtil.allFiles()] },
            (error, res) =>
            {
                if (error)
                    return;

                this.uploadDocument(res.uri, res.type, res.fileName, res.fileSize);
            });

    }
    openCamera = () =>
    {
        this.closePicker();
        ImagePicker.launchCamera({}, (response) =>
        {
            this.uploadImage(response);
        });
    }
    openGalery = () =>
    {
        this.closePicker();
        ImagePicker.launchImageLibrary({}, (response) =>
        {
            this.uploadImage(response);
        });
    }
    uploadImage = (response) =>
    {
        if (response.didCancel)
            return;

        if (response.error) 
        {
            this.messageHandler.showToast(response.error);
        }
        else
        {
            let source = response.data;
            if (!response.fileName)
                response.fileName = "image.jpg";
            this.upload(source, response.fileName);
        }
    }
    uploadDocument = (uri: string, type: string, fileName: string, fileSize: number) =>
    {
        let url = uri
        const split = url.split('/');
        const name = split.pop();
        const inbox = split.pop();
        const realPath = `${RNFS.ExternalStorageDirectoryPath}/${inbox}/${name}`;

        RNFS.readFile(uri, 'base64')
            .then(fileCode => this.upload(fileCode, fileName))
            .catch(() => { })
    }
    upload(dataUrl: string, type: string) 
    {
        this.isUploadCanceled = false;
        this.progressBarHandler.showProgress(this.strings.loadingFile, () => { this.cancelUpload() })
        let onSuccess = (data) =>
        {
            if (data.progress > 0)
            {
                if (!this.isUploadCanceled)
                    this.progressBarHandler.updateProgressVal(data.progress);
                if (data.isLast)
                {
                    this.progressBarHandler.hideProgress();
                    this.afterUploadFunc(data.file);
                }
            }
        }
        let onError = (reason) =>
        {
            this.progressBarHandler.hideProgress();
            this.messageHandler.showToast(reason);
        }

        this.form.uploadDataUrl(dataUrl, type, onSuccess, onError);
    }

    cancelUpload()
    {
        this.isUploadCanceled = true;
        this.progressBarHandler.hideProgress();
        this.form.cancelFileUpload();
    }

    render()
    {
        let isRenderFiles = this.strings.platform === 'android';
        let menuItems = [
            {
                text: this.strings.camera,
                icon: iconNames.camera,
                onPress: this.openCamera,
            },
            {
                text: this.strings.photoGalery,
                icon: iconNames.image,
                onPress: this.openGalery,
            },
            isRenderFiles &&
            {
                text: this.strings.files,
                icon: iconNames.folder,
                onPress: this.openDocumentPicker,
            },
        ];
        return (
            <SlideinMenu items={menuItems} onRef={menu => this.slideinMenu = menu} />
        );
    }
}