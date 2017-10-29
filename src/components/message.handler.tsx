import { Alert, ActivityIndicator } from 'react-native';
import { Strings } from '../modules';
import { MessageOptions } from '../modules/messageOptions.class';
import Toast from 'react-native-simple-toast';

export class MessageHandler
{
    // private dnotAskMeAgain: boolean;

    constructor(private strings: Strings)
    {

    }
    // ******************************************** Toast ***************************************************
    public showToast(message: string, isLong: boolean = false)
    {
        let dur = isLong ? Toast.LONG : Toast.SHORT;
        Toast.showWithGravity(message, dur, Toast.TOP);
        // if (this.alert == null && this.loading == null)
        // {
        //     toast.setMessage(message);
        //     toast.present();
        // }
    }
    // ******************************************** Loading ***************************************************

    /** Presents a loading with transparent backdrop. Default spinner is 'crescent'. */
    public showTransLoading(spinner: string = "", message: string = "")
    {
        // this.showLoading(message, { cssClass: transparentCssClass + " " + Constants.dirByLang, spinner: spinner });
    }

    /** Presents a loading component.Used to indicate that a heavy operation is performed.*/
    public showLoading(message: string/*, loadingOptions?: MessageOptions*/)
    {

        // let wasLoadingShown = this.loading != null;
        // let options: MessageOptions =
        //     {
        //         cssClass: Constants.dirByLang,
        //         duration: null,
        //         isShowBackDrop: true,
        //         spinner: ""
        //     };
        // options = Object.assign(options, loadingOptions);

        // //Creates a loading.
        // this.loading = this.loadingController.create({
        //     content: message,
        //     spinner: options.spinner,
        //     cssClass: options.cssClass,
        //     showBackdrop: options.isShowBackDrop
        // });
        // //Presentation.
        // if (this.alert == null && !wasLoadingShown)
        //     this.loading.present();



    }

    /**Dismisses the current loading if there is one.
     */
    public hideLoading(afterDismiss: Function = null)
    {
        // if (this.loading != null)
        // {
        //     this.loading.dismiss().then(
        //         () =>
        //         {
        //             if (afterDismiss != null)
        //                 afterDismiss();
        //         });
        // }
        // else if (afterDismiss != null)
        //     afterDismiss();
        // this.loading = null;

    }
    // ******************************************** Alert ***************************************************

    /**Presents an alert with two buttons: 'ok' and 'cancel'. Buttons text can be overridden by sending a different text in 'messageOptions'. 
     * Calls 'onApprove' when the 'ok' button is clicked. Calls 'onCancel' when the 'cancel' button is clicked.
     * Used to show an error or a warning message. */
    public showErrorOrWarning(isError: boolean, message: string, onApprove = () => { }, onCancel = () => { }, messageOptions: MessageOptions = {})
    {

        // message buttons
        let buttonsArr = [];
        let approveText = this.strings.ok;
        let cancelText = this.strings.cancel;
        if (messageOptions.buttonsText && messageOptions.buttonsText.length === 2)
        {
            approveText = messageOptions.buttonsText[0];
            cancelText = messageOptions.buttonsText[1];
        }

        let cancelButton =
            {
                text: cancelText,
                click: () =>
                {
                    onCancel();
                }
            };

        let okButton =
            {
                text: approveText,
                click: () =>
                {
                    if (!isError)
                        onApprove();
                }
            };

        if (isError)
            buttonsArr = [okButton];
        else
            buttonsArr = [okButton, cancelButton];
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
    public showChangesNotSavedAnsAsk(event, onSaveAndContinue, onUndoAndContinue)
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
    public showMessage(message: string, buttons: any[], messageOptions?)
    {
        if (message == null)
        {
            return;
        }
        //message = message.replace(/(\r\n|\n|\r)/gm, "<br>");
        let options: MessageOptions =
            {
                cssClass: this.strings.dirByLang,
                duration: null,
                isShowBackDrop: true,
                spinner: "crescent",
                title: this.strings.defaultMsgTitle
            };
        options = Object.assign(options, messageOptions);

        // Buttons
        let buttonsarr = new Array();
        buttons.forEach((button) =>
        {
            buttonsarr.push(
                {
                    text: button.text,
                    onPress: () =>
                    {
                        button.click();
                    }
                });
        });

        // Creates an alert and presents it.
        Alert.alert(
            options.title,
            message,
            buttonsarr,
            { cancelable: false }
        )
        // this.alert = this.alertController.create({
        //     title: options.title,
        //     message: message,
        //     enableBackdropDismiss: false,
        //     buttons: buttonsarr,
        //     cssClass: options.cssClass
        // });
        // this.alert.onDidDismiss(
        //     () =>
        //     {
        //         this.alert = null;
        //         //If there was a request to show 'loading' - preset it after the alert is dismissed.
        //         if (this.loading != null)
        //             this.loading.present();
        //     });
        // if (this.loading != null)
        // {
        //     this.loading.dismiss().then(() =>
        //     {
        //         this.alert.present();
        //     });
        //     this.loading = null;
        // }
        // else
        // {
        //     this.alert.present();
        // }

    }

}
