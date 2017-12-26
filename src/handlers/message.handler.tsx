
import React, { Component } from 'react';
import { Strings } from '../modules';
import { MessageOptions } from '../modules/messageOptions.class';
import { ErrAndWarnMsgOpts } from '../modules/errAndWarnMsgOpts.class';
import Toast from 'react-native-simple-toast';
import { inject, observer, } from 'mobx-react';
import { observable } from 'mobx';
import { View, Text, StyleSheet, Platform, ActivityIndicator, BackHandler } from 'react-native';
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
    // private dnotAskMeAgain: boolean;
    strings: Strings;

    @observable alert: MessageOptions
    @observable loading: MessageOptions;

    constructor(props)
    {
        super(props);
        this.strings = this.props.strings;
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
        let backdropOpacity = 0;
        // loading can be shown with or without backdrop while alert is always presented with backdrop.
        if (this.alert || this.loading.overlay)
            backdropOpacity = 0.22;
        return (
            <View style={[styles.absolute, { backgroundColor: backdropColor, opacity: backdropOpacity }]} />
        );
    }
    renderAlert()
    {
        let alertTextAlign = this.strings.platform === 'ios' ? { textAlign: 'center' } : textAlign(this.strings.isRTL);
        return (
            <View style={styles.alertContainer}>
                <Text style={[styles.messageTitle, alertTextAlign]}>{this.alert.title}</Text>
                <Text style={[styles.message, alertTextAlign]} >{this.alert.message}</Text>
                {this.renderAlertButtons()}
            </View>
        );
    }
    renderAlertButtons()
    {
        let flexDir = flexDirection(!this.strings.isRTL);
        return (
            <View style={[styles.buttonsContainer, flexDir]}>
                {
                    this.alert.buttons.map(({ text, onPress }, idx) => (
                        <View style={flexDir} key={idx}>
                            {idx === 1 && this.renderButtonDivider()}
                            <ButtonComp
                                title={text}
                                buttonStyle={styles.button}
                                containerViewStyle={styles.btnContainer}
                                textStyle={styles.btnText}
                                backgroundColor='transparent'
                                color={colors.primaryColor}
                                onPress={() => onPress()} />
                        </View>
                    ))
                }
            </View>
        )
    }
    renderButtonDivider()
    {
        if (this.strings.platform !== 'ios')
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


        let cancelButton =
            {
                text: cancelText,
                onPress: () =>
                {
                    this.hideAlert();
                    onCancel();
                }
            };

        let okButton =
            {
                text: approveText,
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
    public showChangesNotSaved(onSaveAndContinue, onUndoAndContinue)
    {

        // let cancel: ButtonOptions = {
        //     text: Constants.cancel,
        //     click: () => { }
        // };
        // let saveAndCont: ButtonOptions = {
        //     text: Constants.saveAndCont,
        //     click: () =>
        //     {
        //         onSaveAndContinue();
        //     }
        // };
        // let undoAndCond: ButtonOptions = {
        //     text: Constants.cancelAndCont,
        //     click: () =>
        //     {
        //         onUndoAndContinue();
        //     }
        // };
        // this.showMessage(Constants.changesNotSavedText, [saveAndCont, undoAndCond, cancel], { title: Constants.warningTitle, cssClass: Constants.dirByLang });

    }

    /**Presents an alert with three buttons: 'save-and-continue', 'cancel-and-continue', 'cancel', and 'dnot-ask-me-again' checkbox.
     * Calls 'onSaveAndContinue' when 'save-and-continue' is clicked. 
     * Calls 'onUndoAndContinue' when 'cancel-and-continue' is clicked.
     * User's choice of the 'dont-ask-me-again' checkbox is sent to the 'onSaveAndContinue' func. 
     * Used in case there are changes that were not saved in the current view and the user wants to navigate to another view.
     */
    public showChangesNotSavedAndAsk(event, onSaveAndContinue, onUndoAndContinue)
    {
        // this.dnotAskMeAgain = false;
        // let alertPopover;
        // let dontAskMeBtn: ButtonOptions = {
        //     text: Constants.neverAskAgain,
        //     type: 'checkbox',
        //     click: () =>
        //     {
        //         this.dnotAskMeAgain = !this.dnotAskMeAgain;
        //     }
        // };
        // let saveAndCont: ButtonOptions = {
        //     text: Constants.saveAndCont,
        //     type: "button",
        //     click: () =>
        //     {
        //         onSaveAndContinue(this.dnotAskMeAgain);
        //         alertPopover.dismiss()
        //     }
        // };
        // let undoAndCond: ButtonOptions = {
        //     text: Constants.cancelAndCont,
        //     type: "button",
        //     disabled: () =>
        //     {
        //         return this.dnotAskMeAgain;
        //     },
        //     click: () =>
        //     {
        //         onUndoAndContinue();
        //         alertPopover.dismiss()
        //     }
        // };
        // let cancel: ButtonOptions = {
        //     text: Constants.cancel,
        //     type: "button",
        //     disabled: () =>
        //     {
        //         return this.dnotAskMeAgain;
        //     },
        //     click: () => 
        //     {
        //         alertPopover.dismiss();
        //     }
        // };

        // alertPopover = this.popoverCtrl.create(
        //     MenuPopup,
        //     {
        //         message: Constants.changesNotSavedText,
        //         items: [dontAskMeBtn, saveAndCont, undoAndCond, cancel],
        //         nolines: true,
        //         cssClass: Constants.dirByLang
        //     });

        // alertPopover.present();
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

        // Creates an alert and presents it.
        this.alert =
            {
                title: options.title,
                message: options.message,
                buttons: options.buttons
            };

    }
    hideAlert()
    {
        this.alert = null;
    }

}
const styles = StyleSheet.create({
    alertContainer:
        {
            width: scale(337),
            height: scale(190),
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
    line: {
        height: 0.5,
        backgroundColor: colors.middleGrayLight,
    },
    buttonsContainer:
        {
            ...Platform.select({
                ios: {
                    borderTopWidth: 0.5,
                    borderColor: colors.middleGrayLight,
                    justifyContent: 'space-around'
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
    button: {
        padding: 0,
        marginHorizontal: 0,
        ...Platform.select({
            ios: {
                paddingVertical: scale(21),
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
    message:
        {
            color: colors.middleDarkGray,
            marginTop: scale(-25),
            ...Platform.select({
                ios:
                    {
                        marginTop: scale(-30),
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