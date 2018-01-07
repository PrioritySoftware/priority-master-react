import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
    View,
    TextInput,
    WebView
} from 'react-native';
import { Strings, Form } from '../modules';
import { ConfigService } from '../providers/config.service';
import { colors, container } from '../styles/common';
import { FormService } from '../providers/form.service';
import { Messages } from '../handlers/index';
import { MessageHandler } from '../handlers/message.handler';
import { observer, inject } from 'mobx-react';
import { ObservableMap, observable } from 'mobx';
import { scale } from '../utils/scale';

@inject("formService", "strings")

@observer
export class FormText extends Component<any, any>
{
    static propTypes =
        {
            formPath: PropTypes.string.isRequired,
        };

    messageHandler: MessageHandler;
    configService: ConfigService;
    formService: FormService;
    strings: Strings;

    form: Form;
    formRow: ObservableMap<any>;

    htmlCode: string;
    formActions;
    @observable inputText: string;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;
        this.strings = this.props.strings;
        this.messageHandler = this.props.messageHandler;

        this.form = this.formService.getForm(this.props.formPath);
        let rows = this.formService.getLocalRows(this.form);
        this.formRow = rows.get("1");
        this.formActions = this.props.formActions;

        this.inputText = "";
    }
    componentDidMount()
    {
        this.messageHandler = Messages;
        if (this.formActions)
        {
            this.formActions({
                save: this.save,
                undo: this.undo,
                checkChanges: this.checkChanges
            });
        }
    }
    /*
    * Gets form's text as html.
    * @memberof FormText
    */
    getHTML = () =>
    {
        if (this.formRow)
        {
            let html = this.formRow.get("htmltext");
            this.htmlCode = html.replace(/<p/g, '<p style="margin:0;font-family:Arial"');
        }
        else
            this.htmlCode = null;
    }

    setIsChangesSaved(issaved: boolean)
    {
        this.formService.setIsRowChangesSaved(this.form, 1, issaved);
    }
    checkChanges = () =>
    {
        return this.formService.getIsRowChangesSaved(this.form, 1);
    }
    save = (afterSaveFunc = null) =>
    {
        if (this.inputText.trim() !== "")
        {
            this.inputText = this.inputText.replace(/(?:\r\n|\r|\n)/g, '<br/>');
            this.messageHandler.showLoading();
            this.formService.saveText(this.form, this.inputText)
                .then(() =>
                {
                    this.setIsChangesSaved(true);
                    this.messageHandler.hideLoading();
                    this.messageHandler.showToast(this.strings.changesSavedText);
                    if (afterSaveFunc)
                        afterSaveFunc();
                })
                .catch(() => this.messageHandler.hideLoading());
            this.inputText = '';
        }
    }
    undo = (afterUndoFunc = null) =>
    {
        this.setIsChangesSaved(true);
        this.inputText = '';
        if (afterUndoFunc)
            afterUndoFunc();
    }
    handleChange = (value) =>
    {
        if (value !== "")
            this.setIsChangesSaved(false);
        else
            this.setIsChangesSaved(true);
        this.inputText = value
    }

    render()
    {
        return (
            <View style={container}>
                {this.renderInput()}
                {this.renderHTML()}

            </View>
        )
    }
    renderInput()
    {
        let isRTL = this.strings.isRTL;
        if (!this.form.ishtmleditable)
            return (null);

        return (
            <TextInput
                value={this.inputText}
                onChangeText={(text) => this.handleChange(text)}
                style={[styles.freeTextInputText, isRTL ? styles.rtlAlign : styles.ltrAlign]}
                underlineColorAndroid="transparent"
                blurOnSubmit={false}
                multiline
            />
        )
    }
    renderHTML()
    {
        this.getHTML();
        return (
            <WebView
                source={{ html: this.htmlCode }}
                style={styles.textCntainer}
                scalesPageToFit={this.strings.platform !== 'ios'}
                dataDetectorTypes='none'
            />
        )
    }

}
/*********** style ************* */
const styles = StyleSheet.create({

    freeTextInputText:
        {
            height: '30%',
            borderColor: colors.darkGray,
            borderWidth: 0.5,
            padding: 5,
            margin: 10,
            textAlignVertical: 'top',
            backgroundColor: 'white',
            fontSize:scale(16)
        },
    textCntainer:
        {
            marginHorizontal: 10,
            height: '70%',
            backgroundColor: 'transparent',
        },
    ltrAlign:
        {
            textAlign: 'left'
        },
    rtlAlign:
        {
            textAlign: 'right'
        },

})