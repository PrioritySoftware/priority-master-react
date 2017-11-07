import LocalizedStrings from 'react-native-localization';
import { Platform } from "react-native";
class String
{
    value: string;
    code: number
}
export class Strings
{
    /** Style  */
    dirByLang: string;
    sideByLang: string;
    dirOpposite: string;

    /** Device */
    deviceDirection: string;
    platform: string;
    private localInfo: LocalizedStrings;

    /** First Launch */
    private _scanInstructions: String = { value: "", code: 0 };
    public get scanInstructions(): string
    {
        return this.getString(this._scanInstructions);
    }
    private _scanButton: String = { value: "", code: 0 };
    public get scanButton(): string
    {
        return this.getString(this._scanButton);
    }
    private _scanError: String = { value: "", code: 0 };
    public get scanError(): string
    {
        return this.getString(this._scanError);
    }
    private _scanPermissionError: String = { value: "", code: 0 };
    public get scanPermissionError(): string
    {
        return this.getString(this._scanPermissionError);
    }
    private _preparingApp: String = { value: "", code: 0 };
    public get preparingApp(): string
    {
        return this.getString(this._preparingApp);
    }
    private _failedToReadJsonError: String = { value: "", code: 0 };
    public get failedToReadJsonError(): string
    {
        return this.getString(this._failedToReadJsonError);
    }
    private _failedToLoadJsonError: String = { value: "", code: 0 };
    public get failedToLoadJsonError(): string
    {
        return this.getString(this._failedToLoadJsonError);
    }
    private _certificateProblem: String = { value: "", code: 0 };
    public get certificateProblem(): string
    {
        return this.getString(this._certificateProblem);
    }
    private _scanNewConfigurationFile: String = { value: "", code: 0 };
    public get scanNewConfigurationFile(): string
    {
        return this.getString(this._scanNewConfigurationFile);
    }

    /** Menu */
    private _menuTitle: String = { value: "", code: 0 };
    public get menuTitle(): string
    {
        return this.getString(this._menuTitle);
    }
    private _logout: String = { value: "", code: 0 };
    public get logout(): string
    {
        return this.getString(this._logout);
    }
    private _switchApp: String = { value: "", code: 0 };
    public get switchApp(): string
    {
        return this.getString(this._switchApp);
    }
    private _newApp: String = { value: "", code: 0 };
    public get newApp(): string
    {
        return this.getString(this._newApp);
    }
    private _switchCompany: String = { value: "", code: 0 };
    public get switchCompany(): string
    {
        return this.getString(this._switchCompany);
    }
    private _terms: String = { value: "", code: 0 };
    public get terms(): string
    {
        return this.getString(this._terms);
    }
    private _termsURL: String = { value: "", code: 0 };
    public get termsURL(): string
    {
        return this.getString(this._termsURL);
    }
    private _policy: String = { value: "", code: 0 };
    public get policy(): string
    {
        return this.getString(this._policy);
    }
    private _policyURL: String = { value: "", code: 0 };
    public get policyURL(): string
    {
        return this.getString(this._policyURL);
    }

    /** Text */
    private _wait: String = { value: "", code: 0 };
    public get wait(): string
    {
        return this.getString(this._wait);
    }
    private _usrTitle: String = { value: "", code: 0 };
    public get usrTitle(): string
    {
        return this.getString(this._usrTitle);
    }
    private _pswTitle: String = { value: "", code: 0 };
    public get pswTitle(): string
    {
        return this.getString(this._pswTitle);
    }
    private _changePswHeader1: String = { value: "", code: 0 };
    public get changePswHeader1(): string
    {
        return this.getString(this._changePswHeader1);
    }
    private _changePswHeader2: String = { value: "", code: 0 };
    public get changePswHeader2(): string
    {
        return this.getString(this._changePswHeader2);
    }
    private _changePswMessageOk: String = { value: "", code: 0 };
    public get changePswMessageOk(): string
    {
        return this.getString(this._changePswMessageOk);
    }
    private _oldPsw: String = { value: "", code: 0 };
    public get oldPsw(): string
    {
        return this.getString(this._oldPsw);
    }
    private _newPsw: String = { value: "", code: 0 };
    public get newPsw(): string
    {
        return this.getString(this._newPsw);
    }
    private _confirmNewPsw: String = { value: "", code: 0 };
    public get confirmNewPsw(): string
    {
        return this.getString(this._confirmNewPsw);
    }
    private _errors: String = { value: "", code: 0 };
    public get errors(): string
    {
        return this.getString(this._errors);
    }
    private _fatalErrorMsg: String = { value: "", code: 0 };
    public get fatalErrorMsg(): string
    {
        return this.getString(this._fatalErrorMsg);
    }
    private _warningTitle: String = { value: "", code: 0 };
    public get warningTitle(): string
    {
        return this.getString(this._warningTitle);
    }
    private _errorTitle: String = { value: "", code: 0 };
    public get errorTitle(): string
    {
        return this.getString(this._errorTitle);
    }
    private _changesSavedText: String = { value: "", code: 0 };
    public get changesSavedText(): string
    {
        return this.getString(this._changesSavedText);
    }
    private _changesNotSavedText: String = { value: "", code: 0 };
    public get changesNotSavedText(): string
    {
        return this.getString(this._changesNotSavedText);
    }
    private _cannotGoToSubForm: String = { value: "", code: 0 };
    public get cannotGoToSubForm(): string
    {
        return this.getString(this._cannotGoToSubForm);
    }
    private _saveBeforeAttach: String = { value: "", code: 0 };
    public get saveBeforeAttach(): string
    {
        return this.getString(this._saveBeforeAttach);
    }
    private _loadData: String = { value: "", code: 0 };
    public get loadData(): string
    {
        return this.getString(this._loadData);
    }
    private _appSubTitle: String = { value: "", code: 0 };
    public get appSubTitle(): string
    {
        return this.getString(this._appSubTitle);
    }
    private _isDelete: String = { value: "", code: 0 };
    public get isDelete(): string
    {
        return this.getString(this._isDelete);
    }
    private _isExitApp: String = { value: "", code: 0 };
    public get isExitApp(): string
    {
        return this.getString(this._isExitApp);
    }
    private _loadingFile: String = { value: "", code: 0 };
    public get loadingFile(): string
    {
        return this.getString(this._loadingFile);
    }
    private _maxLengthForField: String = { value: "", code: 0 };
    public get maxLengthForField(): string
    {
        return this.getString(this._maxLengthForField);
    }
    private _search: String = { value: "", code: 0 };
    public get search(): string
    {
        return this.getString(this._search);
    }
    private _searchError: String = { value: "", code: 0 };
    public get searchError(): string
    {
        return this.getString(this._searchError);
    }
    private _scrollLoadingText: String = { value: "", code: 0 };
    public get scrollLoadingText(): string
    {
        return this.getString(this._scrollLoadingText);
    }
    private _cameraError: String = { value: "", code: 0 };
    public get cameraError(): string
    {
        return this.getString(this._cameraError);
    }
    private _directActivationsTitle: String = { value: "", code: 0 };
    public get directActivationsTitle(): string
    {
        return this.getString(this._directActivationsTitle);
    }
    private _noDirectActivations: String = { value: "", code: 0 };
    public get noDirectActivations(): string
    {
        return this.getString(this._noDirectActivations);
    }
    private _loadingSearchResults: String = { value: "", code: 0 };
    public get loadingSearchResults(): string
    {
        return this.getString(this._loadingSearchResults);
    }
    private _forgotPassword: String = { value: "", code: 0 };
    public get forgotPassword(): string
    {
        return this.getString(this._forgotPassword);
    }
    private _noCompanyIsAllowed: String = { value: "", code: 3 };
    public get noCompanyIsAllowed(): string
    {
        return this.getString(this._noCompanyIsAllowed);
    }
    private _procedureNotSupported: String = { value: "", code: 0 };
    public get procedureNotSupported(): string
    {
        return this.getString(this._procedureNotSupported);
    }

    /** Buttons text */
    private _loginBtn: String = { value: "", code: 0 };
    public get loginBtn(): string
    {
        return this.getString(this._loginBtn);
    }
    private _loginHeader: String = { value: "", code: 0 };
    public get loginHeader(): string
    {
        return this.getString(this._loginHeader);
    }
    private _changePswBtn: String = { value: "", code: 0 };
    public get changePswBtn(): string
    {
        return this.getString(this._changePswBtn);
    }
    private _ok: String = { value: "", code: 0 };
    public get ok(): string
    {
        return this.getString(this._ok);
    }
    private _cancel: String = { value: "", code: 0 };
    public get cancel(): string
    {
        return this.getString(this._cancel);
    }
    private _defaultMsgTitle: String = { value: "", code: 0 };
    public get defaultMsgTitle(): string
    {
        return this.getString(this._defaultMsgTitle);
    }
    private _editBtnText: String = { value: "", code: 0 };
    public get editBtnText(): string
    {
        return this.getString(this._editBtnText);
    }
    private _deleteBtnText: String = { value: "", code: 0 };
    public get deleteBtnText(): string
    {
        return this.getString(this._deleteBtnText);
    }
    private _deleteRowText: String = { value: "", code: 0 };
    public get deleteRowText(): string
    {
        return this.getString(this._deleteRowText);
    }
    private _addNewBtnText: String = { value: "", code: 0 };
    public get addNewBtnText(): string
    {
        return this.getString(this._addNewBtnText);
    }
    private _saveBtnText: String = { value: "", code: 0 };
    public get saveBtnText(): string
    {
        return this.getString(this._saveBtnText);
    }
    private _saveAndCont: String = { value: "", code: 0 };
    public get saveAndCont(): string
    {
        return this.getString(this._saveAndCont);
    }
    private _cancelAndCont: String = { value: "", code: 0 };
    public get cancelAndCont(): string
    {
        return this.getString(this._cancelAndCont);
    }
    private _addAttach: String = { value: "", code: 0 };
    public get addAttach(): string
    {
        return this.getString(this._addAttach);
    }
    private _openBtnText: String = { value: "", code: 0 };
    public get openBtnText(): string
    {
        return this.getString(this._openBtnText);
    }
    private _changeBtnText: String = { value: "", code: 0 };
    public get changeBtnText(): string
    {
        return this.getString(this._changeBtnText);
    }
    private _textPlaceholder: String = { value: "", code: 0 };
    public get textPlaceholder(): string
    {
        return this.getString(this._textPlaceholder);
    }
    private _approveReadOnly: String = { value: "", code: 0 };
    public get approveReadOnly(): string
    {
        return this.getString(this._approveReadOnly);
    }
    private _approveEditText: String = { value: "", code: 0 };
    public get approveEditText(): string
    {
        return this.getString(this._approveEditText);
    }
    private _camera: String = { value: "", code: 0 };
    public get camera(): string
    {
        return this.getString(this._camera);
    }
    private _files: String = { value: "", code: 0 };
    public get files(): string
    {
        return this.getString(this._files);
    }
    private _photoGalery: String = { value: "", code: 0 };
    public get photoGalery(): string
    {
        return this.getString(this._photoGalery);
    }
    private _showAllItems: String = { value: "", code: 0 };
    public get showAllItems(): string
    {
        return this.getString(this._showAllItems);
    }

    /** Validation errors */
    private _decimalValidErr: String = { value: "", code: 0 };
    public get decimalValidErr(): string
    {
        return this.getString(this._decimalValidErr);
    }
    private _numberValidErr: String = { value: "", code: 0 };
    public get numberValidErr(): string
    {
        return this.getString(this._numberValidErr);
    }
    private _lengthValidErr: String = { value: "", code: 0 };
    public get lengthValidErr(): string
    {
        return this.getString(this._lengthValidErr);
    }

    constructor()
    {
        this.localInfo = new LocalizedStrings({});
        if (this.localInfo.getInterfaceLanguage().startsWith('he') || this.localInfo.getInterfaceLanguage().startsWith('iw'))
        {
            this.deviceDirection="rtl";
            this.setFirstRtlConstants();
            this.setRtlConstants();
        }
        else
        {
            this.deviceDirection="ltr";
            this.setFirstLtrConstants();
            this.setLtrConstants();
        }
        this.platform = Platform.OS;
        this._policy.value = "Privacy policy";
        this._policyURL.value = "https://s3.priority-software.com/terms/master_privacy_policy.pdf";
        if (Platform.OS === 'ios')
            this._termsURL.value = "https://s3.priority-software.com/terms/master_termsofuse_appstore.pdf";
        else
            this._termsURL.value = "https://s3.priority-software.com/terms/master_termsofuse_googleplay.pdf";
    }
    setFirstRtlConstants()
    {
        this._scanInstructions.value = "סרוק את הקוד QR כדי להתחיל";
        this._scanButton.value = "סרוק";
        this._scanError.value = "היתה בעיה עם סריקת הברקוד, נסו שוב";
        this._scanPermissionError.value="אין הרשאה להשתמש במצלמה. אנא בדוק את ההגדרות.";
        this._preparingApp.value = "מכין עבורך את האפליקציה, אנא המתן";
        this._failedToReadJsonError.value = "קובץ קונפיגורציה לא תקין.";
        this._failedToLoadJsonError.value = "נכשל בטעינת קובץ קונפיגורציה. אנא בדוק את החיבור ל WIFI.";
        this._certificateProblem.value = "נכשל בטעינת קובץ קונפיגורציה. אנא בדוק את תקינות תעודת האבטחה (Certificate).";
        this._scanNewConfigurationFile.value = " \nפנה למנהל המערכת או סרוק קוד QR חדש";
        this.dirByLang = "rtl";
        this._newApp.value = "הוסף יישומון";
        this._defaultMsgTitle.value = "הודעה";
        this._isDelete.value = "מחיקה?";
        this._deleteBtnText.value = "מחק";

        this._ok.value = "אישור";
        this._cancel.value = "ביטול";
    }

    setRtlConstants() 
    {
        this._menuTitle.value = "תפריט";
        this._logout.value = "התנתק";
        this._switchApp.value = "החלף יישומון";
        this._newApp.value = "הוסף יישומון";
        this._switchCompany.value = "החלף חברה";
        this._terms.value = "תנאי שימוש";

        this._usrTitle.value = "שם משתמש";
        this._pswTitle.value = "סיסמא";
        this._changePswHeader1.value = "סיסמתך אינה בתוקף.";
        this._changePswHeader2.value = "לפני כניסה למערכת עליך להחליפה.";
        this._changePswMessageOk.value = "הסיסמה שונתה בהצלחה.";
        this._oldPsw.value = "סיסמא קודמת";
        this._newPsw.value = "סיסמא חדשה";
        this._confirmNewPsw.value = "אישור סיסמא";
        this._wait.value = "אנא המתן...";
        this._errors.value = 'דו"ח שגיאות';
        this._fatalErrorMsg.value = "ארעה תקלה אנא פנה למנהל המערכת: \n";
        this._warningTitle.value = "אזהרה";
        this._errorTitle.value = "שגיאה";
        this._changesSavedText.value = "הנתונים נשמרו בהצלחה!";
        this._changesNotSavedText.value = "ישנם שינויים שלא נשמרו. להמשיך?";
        this._cannotGoToSubForm.value = "לא ניתן לבצע את הפעולה.אנא הכנס נתונים תחילה.";
        this._saveBeforeAttach.value = "ישנם שינויים שלא נשמרו. אנא שמור את הדיווח לפני צרוף נספחים.";
        this._loadData.value = "טוען נתונים...";
        this._appSubTitle.value = "מערכת נוכחות";
        this._isDelete.value = "מחיקה?";
        this._isExitApp.value = "האם אתה בטוח שברצונך לצאת מהמערכת?";
        this._maxLengthForField.value = 'מספר התוים המקסימלי עבור השדה הוא: ';
        this._search.value = "חפש";
        this._scrollLoadingText.value = "טוען רשומות";
        this._cameraError.value = "פתיחת מצלמה נכשלה";
        this._showAllItems.value = "הצג את כל הרשומות";
        this._directActivationsTitle.value = "הפעלות ישירות";
        this._noDirectActivations.value = "לא נבחרו הפעלות";
        this._loadingSearchResults.value = "טוען נתונים נוספים";
        this._forgotPassword.value = "שכחת סיסמא?";
        this._noCompanyIsAllowed.value = "אין לך הרשאות לאף חברה. יש לפנות למנהל המערכת.";
        this._procedureNotSupported.value = "הפרוצדורה לא נתמכת עדיין.";

        this._loginBtn.value = "היכנס";
        this._loginHeader.value = "כניסה למערכת";
        this._changePswBtn.value = "החלף";
        this._ok.value = "אישור";
        this._cancel.value = "ביטול";
        this._defaultMsgTitle.value = "הודעה";
        this._editBtnText.value = "ערוך";
        this._deleteBtnText.value = "מחק";
        this._deleteRowText.value = "מחק רשומה";
        this._addNewBtnText.value = "חדש";
        this._saveBtnText.value = "שמור";
        this._saveAndCont.value = "שמור והמשך";
        this._cancelAndCont.value = "המשך ללא שמירה";
        this._addAttach.value = "נספח חדש";
        this._loadingFile.value = "מעלה את הקובץ...";
        this._openBtnText.value = "פתח";
        this._changeBtnText.value = "שנה";
        this._searchError.value = "לא הוגדרו שדות חיפוש";
        this._camera.value = "מצלמה";
        this._files.value = "קבצים";
        this._photoGalery.value = "גלריית תמונות";

        this._textPlaceholder.value = "הכנס טקסט";
        this._approveReadOnly.value = "קריאה בלבד";
        this._approveEditText.value = "עריכה";
        this.dirByLang = "rtl";
        this.dirOpposite = "ltr";
        this.sideByLang = "right";

        this._decimalValidErr.value = "דיוק עשרוני שגוי";
        this._numberValidErr.value = "הכנס ספרות בלבד";
        this._lengthValidErr.value = 'מספר תוים מקסימלי עבור השדה הוא: ';
    }

    setFirstLtrConstants()
    {
        this._scanInstructions.value = "Scan your QR code to get started";
        this._scanButton.value = "Scan";
        this._scanError.value = "QR code scan failed. Try again";
        this._scanPermissionError.value="There is no permission to use the camera. Please check out the settings.";
        this._preparingApp.value = "Preparing your app. Please wait";
        this._failedToReadJsonError.value = "Invalid configuration file";
        this._failedToLoadJsonError.value = "There was a problem loading the configuration file.\nCheck your Wi-Fi connection.";
        this._scanNewConfigurationFile.value = " \nContact your system administrator or scan a new QR code";

        this.dirByLang = "ltr";
        this._defaultMsgTitle.value = "Message";
        this._ok.value = "OK";
        this._cancel.value = "Cancel";
        this._newApp.value = "New app";
        this._isDelete.value = "Delete?";
        this._deleteBtnText.value = "Delete";
    }

    setLtrConstants()
    {
        this._menuTitle.value = "Menu";
        this._logout.value = "Logout";
        this._switchApp.value = "Switch app";
        this._newApp.value = "New app";
        this._switchCompany.value = "Switch company";
        this._terms.value = "Terms of use";

        this._usrTitle.value = "User name";
        this._pswTitle.value = "Password";
        this._changePswHeader1.value = "Your password is no longer valid.";
        this._changePswHeader2.value = "You must change your password.";
        this._changePswMessageOk.value = "A new password has been assigned.";
        this._oldPsw.value = "Previous password";
        this._newPsw.value = "New password";
        this._confirmNewPsw.value = "Confirm password";
        this._wait.value = "Please wait...";
        this._errors.value = "Error report";
        this._fatalErrorMsg.value = "An error Occurred. Please contact your system administrator.";
        this._warningTitle.value = "Warning";
        this._errorTitle.value = "Error";
        this._changesSavedText.value = "Your change were successfully saved!";
        this._changesNotSavedText.value = "Some changes were not saved. Continue?";
        this._cannotGoToSubForm.value = "The operation could not be executed. Please enter data first.";
        this._saveBeforeAttach.value = "Some changes were not saved. Please save the report before adding an attachment.";
        this._loadData.value = "Loading data...";
        this._appSubTitle.value = "Attendance App";
        this._isDelete.value = "Delete?";
        this._isExitApp.value = "Are you sure you want to exit the application?";
        this._loadingFile.value = "Uploading the file...";
        this._maxLengthForField.value = 'Maximum length for this field is: ';
        this._search.value = " Search";
        this._searchError.value = "No search fields defined"
        this._scrollLoadingText.value = "Loading more data";
        this._cameraError.value = "Failed to open camera";
        this._showAllItems.value = "Show all items";
        this._directActivationsTitle.value = "Direct Activations";
        this._noDirectActivations.value = "No activations were chosen";
        this._loadingSearchResults.value = "Loading more data";
        this._forgotPassword.value = "Forgot password?";
        this._noCompanyIsAllowed.value = "You have no privileges in any company. Please consult your system manager.";
        this._procedureNotSupported.value = "The procedure is not supported yet.";

        this._loginBtn.value = "Login";
        this._loginHeader.value = "";
        this._changePswBtn.value = "Change"
        this._ok.value = "OK";
        this._cancel.value = "Cancel";
        this._defaultMsgTitle.value = "Message";
        this._editBtnText.value = "Edit";
        this._deleteBtnText.value = "Delete";
        this._deleteRowText.value = "Delete Record";
        this._addNewBtnText.value = "Add new";
        this._saveBtnText.value = "Save";
        this._saveAndCont.value = "Save and continue";
        this._cancelAndCont.value = "Continue without saving";
        this._addAttach.value = "Attach file";
        this._openBtnText.value = "Open";
        this._changeBtnText.value = "Change";
        this._camera.value = "Camera";
        this._files.value = "Files";
        this._photoGalery.value = "Photo Galery";

        this._textPlaceholder.value = "Enter text";
        this._approveReadOnly.value = "Read only";
        this._approveEditText.value = "Edit";
        this.dirByLang = "ltr";
        this.dirOpposite = "rtl";
        this.sideByLang = "left";

        this._decimalValidErr.value = "Wrong decimal precision";
        this._numberValidErr.value = "Digits only";
        this._lengthValidErr.value = "Maximum length for field is: ";
    }
    private getString(message: String): string
    {
        if (message && message.value)
            return message.value;
        return "";
    }
}