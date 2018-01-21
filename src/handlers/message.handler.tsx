
import React, { Component } from 'react';
import { Strings } from '../modules';
import { MessageOptions } from '../modules/messageOptions.class';
import { ErrAndWarnMsgOpts } from '../modules/errAndWarnMsgOpts.class';
import Toast from 'react-native-simple-toast';
import { inject, observer, } from 'mobx-react';
import { observable } from 'mobx';
import { View, Text, StyleSheet, Platform, ActivityIndicator, BackHandler, ScrollView } from 'react-native';
import { scale } from '../utils/scale';
import { colors, flexDirection, textAlign, modal } from '../styles/common';
import Modal from 'react-native-modalbox'
import { ButtonComp } from '../components/button';
import { ButtonOpts } from '../modules/buttonOptions.class';
import { Divider } from 'react-native-elements';

@inject("strings")
@observer
export class MessageHandler extends Component<any, any>
{
    strings: Strings;

    @observable private dontAskMeAgain: boolean;
    @observable alert: MessageOptions
    @observable loading: MessageOptions;

    alertList: MessageOptions[];

    constructor(props)
    {
        super(props);
        this.strings = this.props.strings;
        this.alertList = [];
    }

    componentWillMount()
    {
        this.props.onRef(this);
    }
    componentWillUnmount()
    {
        this.props.onRef(undefined)
    }

    androidBackButton = () =>
    {
        return this.alert != null || this.loading != null;
    }

    getDontAskMeAgain()
    {
        return this.dontAskMeAgain;
    }
    render()
    {
        let isShowModal = this.alert != null || this.loading != null;
        if (!isShowModal)
        {
            BackHandler.removeEventListener('hardwareBackPress', this.androidBackButton);
            return (null);
        }
        BackHandler.addEventListener('hardwareBackPress', this.androidBackButton);
        return (
            <Modal
                entry='top'
                style={modal}
                backdrop={false}
                swipeToClose={false}
                isOpen={true}
                startOpen={true}
            >
                {this.renderBackdrop()}
                {this.alert && this.renderAlert()}
                {!this.alert && this.loading && this.renderLoading()}

            </Modal>
        );
    }
    renderBackdrop()
    {
        let backdropColor = this.alert ? 'black' : colors.lightGray;

        // loading can be shown with or without backdrop while alert is always presented with backdrop.
        let backdropOpacity = this.alert ? 0.22 : this.loading.overlay ? 0.27 : 0;

        return (
            <View style={[styles.absolute, { backgroundColor: backdropColor, opacity: backdropOpacity }]} />
        );
    }
    renderAlert()
    {
        let alertTextAlign = this.strings.platform === 'ios' ? { textAlign: 'center' } : textAlign(this.strings.isRTL);
        return (
            <View style={this.alert.style}>
                <Text style={[styles.messageTitle, alertTextAlign]}>{this.alert.title}</Text>
                <ScrollView contentContainerStyle={[styles.messageContainer, this.alert.title && { paddingTop: scale(20) }]}>
                    <Text style={[styles.message, alertTextAlign]} >{this.alert.message}</Text>
                </ScrollView>
                {this.renderAlertButtons()}
            </View>
        );
    }
    renderAlertButtons()
    {
        // Three buttons are displayed vertically.
        let flexDir = null;
        let containerViewStyle = styles.btnContainerVertical;
        let topBorder = { borderTopWidth: 0 };
        if (this.alert.buttons.length < 3)
        {
            flexDir = flexDirection(!this.strings.isRTL);
            containerViewStyle = styles.btnContainer;
        }
        if (this.strings.platform === 'ios' && this.alert.buttons.length > 0)
        {
            // No need for top border when the first button is a checkbox.
            if (this.alert.buttons[0].type !== 'checkbox')
                topBorder = { borderTopWidth: 0.5 };
        }

        return (
            <View style={[styles.buttonsContainer, flexDir, topBorder]}>
                {
                    this.alert.buttons.map(({ text, onPress, style, type, canBeDisabled }, idx) => (
                        <View style={flexDir} key={idx}>
                            {this.renderButtonDivider(idx)}
                            <ButtonComp
                                title={text}
                                type={type}
                                disabled={canBeDisabled && this.getDontAskMeAgain()}
                                checked={this.getDontAskMeAgain()}
                                buttonStyle={style}
                                containerViewStyle={containerViewStyle}
                                textStyle={type !== 'checkbox' && styles.btnText}
                                backgroundColor='transparent'
                                color={colors.primaryColor}
                                checkedColor={colors.primaryColor}
                                onPress={() => onPress()} />
                        </View>
                    ))
                }
            </View>
        )
    }
    renderButtonDivider(btnIndex: number)
    {
        if (this.strings.platform !== 'ios')
            return (null);

        // Renders divider only for less than three buttons.
        if (this.alert.buttons.length > 2 || btnIndex !== 1)
            return (null);

        let margin = this.strings.isRTL ? { marginRight: -scale(15) } : { marginLeft: -scale(30) };
        return (
            <Divider style={[styles.divider, margin]} />
        );
    }
    renderLoading()
    {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Text>{this.loading.title}</Text>
                <ActivityIndicator style={{ marginTop: 10 }} color={colors.primaryColor} ></ActivityIndicator>
            </View>
        );

    }

    // ******************************************** Toast ***************************************************
    public showToast(message: string, isLong: boolean = false)
    {
        let dur = isLong ? Toast.LONG : Toast.SHORT;
        Toast.showWithGravity(message, dur, Toast.TOP);
    }
    // ******************************************** Loading ***************************************************

    /* Presents a loading component.Used to indicate that a heavy operation is performed.*/
    public showLoading(message: string = '', overlay: boolean = true)
    {
        this.loading =
            {
                title: message,
                overlay: overlay
            };
    }

    /**Dismisses the current loading if there is one.
     */
    public hideLoading(afterDismiss: Function = null)
    {
        this.loading = null;
    }
    // ******************************************** Alert ***************************************************

    /* Presents an alert with two buttons: 'ok' and 'cancel'. Buttons text can be overridden by sending a different text in 'messageOptions'. 
     * Calls 'onApprove' when the 'ok' button is clicked. Calls 'onCancel' when the 'cancel' button is clicked.
     * Used to show an error or a warning message. */
    public showErrorOrWarning(isError: boolean, message: string, onApprove = () => { }, onCancel = () => { }, messageOptions: ErrAndWarnMsgOpts = {})
    {
        // message buttons
        let buttonsArr = [];
        let approveText = messageOptions.approveText || this.strings.ok;
        let cancelText = messageOptions.cancelText || this.strings.cancel;

        Object.assign(messageOptions, { style: styles.alertContainer })

        let cancelButton =
            {
                text: cancelText,
                style: styles.horizontalBtn,
                onPress: () =>
                {
                    this.hideAlert();
                    onCancel();
                }
            };

        let okButton =
            {
                text: approveText,
                style: styles.horizontalBtn,
                onPress: () =>
                {
                    this.hideAlert();
                    onApprove();
                }
            }
        if (isError)
            buttonsArr = [okButton];
        else
            buttonsArr = [cancelButton, okButton];
        this.showMessage(message, buttonsArr, messageOptions);

    }
    /**Presents an alert with three buttons: 'save-and-continue', 'cancel-and-continue', 'cancel'.
     * Calls 'onSaveAndContinue' when 'save-and-continue' is clicked. Calls 'onUndoAndContinue' when 'cancel-and-continue' is clicked.
     * Used in case there are changes that were not saved in the current view and the user wants to navigate to another view.
     */
    public showChangesNotSaved(onSaveAndContinue, onUndoAndContinue, onCancel)
    {
        let btnStyle = this.strings.isRTL ? styles.verticalBtnRTL : styles.verticalBtnLTR;
        let options =
            {
                title: this.strings.warningTitle,
                style: styles.alertContainerLong
            };

        let saveAndCont: ButtonOpts = {
            text: this.strings.saveAndCont,
            style: btnStyle,
            onPress: () =>
            {
                this.hideAlert();
                onSaveAndContinue();
            }
        };
        let undoAndCond: ButtonOpts = {
            text: this.strings.cancelAndCont,
            style: btnStyle,
            onPress: () =>
            {
                this.hideAlert();
                onUndoAndContinue();
            }
        };
        let cancel: ButtonOpts = {
            text: this.strings.cancel,
            style: btnStyle,
            onPress: () =>
            {
                this.hideAlert();
                onCancel();
            }
        };
        this.showMessage(this.strings.changesNotSavedText, [saveAndCont, undoAndCond, cancel], options);
    }

    /**Presents an alert with three buttons: 'save-and-continue', 'cancel-and-continue', 'cancel', and 'dnot-ask-me-again' checkbox.
     * Calls 'onSaveAndContinue' when 'save-and-continue' is clicked. 
     * Calls 'onUndoAndContinue' when 'cancel-and-continue' is clicked.
     * User's choice of the 'dont-ask-me-again' checkbox is sent to the 'onSaveAndContinue' func. 
     * Used in case there are changes that were not saved in the current view and the user wants to navigate to another view.
     */
    public showChangesNotSavedAndAsk(onSaveAndContinue, onUndoAndContinue, onCancel)
    {
        let btnStyle = this.strings.isRTL ? styles.verticalBtnRTL : styles.verticalBtnLTR;
        this.dontAskMeAgain = false;

        let options =
            {
                title: null,
                style: styles.alertContainerLong
            };

        let dontAskMeBtn: ButtonOpts = {
            text: this.strings.neverAskAgain,
            type: 'checkbox',
            onPress: () =>
            {
                this.dontAskMeAgain = !this.dontAskMeAgain;
            }
        };
        let saveAndCont: ButtonOpts = {
            text: this.strings.saveAndCont,
            style: btnStyle,
            onPress: () =>
            {
                this.hideAlert();
                onSaveAndContinue(this.dontAskMeAgain);
            }
        };
        let undoAndCond: ButtonOpts = {
            text: this.strings.cancelAndCont,
            style: btnStyle,
            canBeDisabled: true,
            onPress: () =>
            {
                this.hideAlert();
                onUndoAndContinue();
            }
        };
        let cancel: ButtonOpts = {
            text: this.strings.cancel,
            style: btnStyle,
            canBeDisabled: true,
            onPress: () => 
            {
                this.hideAlert();
                onCancel();
            }
        };

        this.showMessage(this.strings.changesNotSavedText, [dontAskMeBtn, saveAndCont, undoAndCond, cancel], options);
    }
    /* Presents an alert with the given buttons. Each button is of 'ButtonOptions' type.*/
    public showMessage(message: string, buttons: ButtonOpts[] = [], messageOptions?)
    {
        if (message == null)
        {
            return;
        }
        // message = message.replace(/(\r\n|\n|\r)/gm, "<br>");
        let options: MessageOptions =
            {
                title: this.strings.defaultMsgTitle,
                message: message,
                buttons: buttons
            };
        options = Object.assign(options, messageOptions);

        let alert =
            {
                title: options.title,
                message: options.message,
                buttons: options.buttons,
                style: options.style
            };

        // Saves every new alert in an array in order to present them one after the other.
        this.alertList.push(alert);
        this.alert = alert;
    }
    hideAlert()
    {
        // Pops the last alert from the array ( the alert we are hiding).
        // And presents the next alert.
        this.alertList.pop();
        if (this.alertList.length > 0)
            this.alert = this.alertList[this.alertList.length - 1];
        else
            this.alert = null;
    }

}
const styles = StyleSheet.create({
    alertContainer:
        {
            width: scale(337),
            height: scale(200),
            padding: scale(21),
            elevation: 1,
            justifyContent: 'space-between',
            shadowColor: colors.gray,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            backgroundColor: 'white',
            ...Platform.select({
                ios: {
                    borderRadius: 20,
                    padding: 0,
                    paddingTop: scale(21),
                    width: scale(300),
                }
            })
        },
    alertContainerLong:
        {
            width: scale(337),
            height: scale(230),
            padding: scale(21),
            elevation: 1,
            justifyContent: 'space-between',
            shadowColor: colors.gray,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            backgroundColor: 'white',
            ...Platform.select({
                ios: {
                    borderRadius: 20,
                    padding: 0,
                    paddingTop: scale(21),
                    width: scale(300),
                    height: scale(220),
                }
            })
        },
    line: {
        height: 0.5,
        backgroundColor: colors.middleGrayLight,
    },
    buttonsContainer:
        {
            ...Platform.select({
                ios: {
                    borderColor: colors.middleGrayLight,
                    justifyContent: 'space-around',
                }
            })
        },
    btnContainer:
        {
            ...Platform.select({
                ios: {
                    width: scale(150),
                }
            })
        },
    btnContainerVertical:
        {
            ...Platform.select({
                ios: {
                    marginLeft: 0,
                    marginRight: 0,
                    width: scale(300)
                }
            })
        },
    horizontalBtn:
        {
            padding: 0,
            marginHorizontal: 0,
            ...Platform.select({
                ios: {
                    paddingVertical: scale(21),
                }
            })
        },
    verticalBtnRTL:
        {
            padding: 0,
            paddingVertical: scale(10),
            justifyContent: 'flex-end',
            ...Platform.select({
                ios: {
                    borderTopWidth: 0.5,
                    borderColor: colors.middleGrayLight,
                }
            })

        },
    verticalBtnLTR:
        {
            padding: 0,
            paddingVertical: scale(10),
            justifyContent: 'flex-start',
            ...Platform.select({
                ios: {
                    borderTopWidth: 0.5,
                    borderColor: colors.middleGrayLight,
                }
            })
        },
    btnText:
        {
            textAlign: 'left',
            ...Platform.select({
                ios: {
                    textAlign: 'center',
                    width: '100%',
                }
            })
        },
    messageContainer:
        {
            paddingBottom: scale(5),
        },
    message:
        {
            color: colors.middleDarkGray,
            ...Platform.select({
                ios:
                    {
                        paddingHorizontal: scale(21),
                    }
            })

        },
    messageTitle:
        {
            fontSize: 17,
            color: colors.darkBlue,
            fontWeight: '500',
        },
    absolute: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    divider:
        {
            backgroundColor: colors.middleGrayLight,
            height: '100%',
            width: 0.5,
        }

})