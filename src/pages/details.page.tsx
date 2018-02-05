import React, { Component } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    Platform,
    BackHandler,
    Keyboard,

} from 'react-native';
import { container, colors, iconNames, textAlign, margin, flexDirection, body, bodyHeight } from '../styles/common';
import { FormService } from '../providers/form.service';
import { ProcService } from '../providers/Proc.service'
import { HeaderComp } from '../components/header';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ColumnsOptions } from '../modules/columnOptions.class';
import { ItemInput } from '../components/itemInput';
import { observer, inject } from 'mobx-react';
import { Pages } from '.';
import ModalDropdown from 'react-native-modal-dropdown';
import { Column } from '../modules/column.class';
import { Form } from '../modules/form.class';
import { Strings } from '../modules/strings';
import { HorizontalList } from '../components/horizontalList'
import { FormConfig } from '../modules/formConfig.class';
import { DirectActivation } from '../modules/directActivation.class';
import { observable } from 'mobx';
import { FormList } from '../components/formList.comp';
import { Messages, } from '../handlers/index';
import { MessageHandler } from '../handlers/message.handler';
import { scale } from '../utils/scale';
import { Icon } from 'react-native-elements';
import { ConfigService } from '../providers/config.service';
import { ColumnZoomType } from '../modules/columnZoomType.class';

@inject("formService", "strings", "procService", "configService")
@observer
export class DetailsPage extends Component<any, any>
{
    static navigationOptions = { header: null }

    formService: FormService;
    procService: ProcService;
    configService: ConfigService;
    messageHandler: MessageHandler;
    strings: Strings;

    // Props
    title: string;
    form: Form;
    columns: ColumnsOptions;
    itemIndex: number;
    formConfig: FormConfig;

    @observable currentSubFormOpts: { name: string, ishtml?: boolean, actions?: { save?: Function, undo?: Function, checkChanges?: Function } };
    dropdown;

    // keyboard
    keyboardShowListener;
    keyboardHideListener;
    isKeyboardOpen: boolean;
    onKeyboardHide;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;
        this.procService = this.props.procService;
        this.configService = this.props.configService;
        this.strings = this.props.strings;
        this.messageHandler = this.props.messageHandler;

        this.title = this.props.navigation.state.params.title;
        this.form = this.formService.getForm(this.props.navigation.state.params.formPath);
        let parentForm = { name: this.form.parentName };
        this.formConfig = this.formService.getFormConfig(this.form, parentForm);
        this.columns = this.formConfig.detailsColumnsOptions;
        this.itemIndex = this.props.navigation.state.params.itemIndex;
        this.currentSubFormOpts = { ishtml: false, name: null, actions: {} };
    }
    componentDidMount()
    {
        this.messageHandler = Messages;
        BackHandler.addEventListener('hardwareBackPress', this.goBack);
        // Adds keyboard event listeners in order to take care of a case when the user presses one of the header icons (save & back) without closing the keyboard.
        // When the keyboard is dismissed the 'keyboardDidHide' function of each control (textControl, numberControl...) is called.
        this.keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => this.isKeyboardOpen = true);
        this.keyboardHideListener = Keyboard.addListener('keyboardDidHide', () =>
        {
            this.isKeyboardOpen = false;
            if (this.onKeyboardHide)
                this.onKeyboardHide();
            this.onKeyboardHide = null;
        });
    }
    componentWillUnmount()
    {
        this.keyboardHideListener.remove();
        this.keyboardShowListener.remove();
    }
    focusAndPressIcon = (afterDismissFunc) =>
    {
        if (this.isKeyboardOpen)
        {
            this.onKeyboardHide = afterDismissFunc;
            // Dismissing the keyboard triggers field updates.
            Keyboard.dismiss();
        }
        else
        {
            afterDismissFunc();
        }
    }
    isSearch(formCol: Column)
    {
        return formCol && (formCol.zoom === ColumnZoomType.Search || formCol.zoom === ColumnZoomType.Choose);
    }
    getIsChangesSaved()
    {
        let subFormCheckChanges = this.currentSubFormOpts.actions.checkChanges;
        if (subFormCheckChanges)
            return subFormCheckChanges();
        return this.formService.getIsRowChangesSaved(this.form, this.itemIndex);
    }
    getIsNewRow()
    {
        return this.formService.getIsNewRow(this.form, this.itemIndex);
    }
    getIsChangesSavedAndNewRow()
    {
        return this.getIsChangesSaved() && this.getIsNewRow();
    }
    goBack = () =>
    {
        // When there are no changes made for a new row, delete the row before navigating back.
        if (this.getIsChangesSavedAndNewRow())
        {
            this.deleteNewRow();
        }
        else
        {
            this.checkForChanges()
                .then(() => this.navigateBack())
                .catch(() => { });
        }

        return true;
    }
    navigateBack()
    {
        BackHandler.removeEventListener('hardwareBackPress', this.goBack);
        this.props.navigation.goBack();
    }
    getNavigation(colName: string)
    {
        let colConfig = this.columns[colName];
        let col = this.form.columns[colName];
        if (colConfig.subtype === 'barcode' || this.isSearch(col))
            return this.props.navigation;
        return null;
    }
    checkForChanges(isShowAsk: boolean = false): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            if (!this.getIsChangesSaved())
            {
                if (isShowAsk)
                    this.showChangesNotSavedAndAsk(resolve, reject);
                else
                    this.showChangesNotSaved(resolve, reject);
            }
            else
            {
                resolve();
            }
        });
    }
    showChangesNotSaved(resolve, reject)
    {
        this.messageHandler.showChangesNotSaved(
            () => this.save(resolve),
            () =>
            {
                if (this.getIsNewRow())
                    this.deleteNewRow();
                else
                    this.undo(resolve);
            },
            reject);
    }
    showChangesNotSavedAndAsk(resolve, reject)
    {
        if (this.configService.getIsHideSaveMessage())
        {
            this.save(resolve);
            return;
        }
        this.messageHandler.showChangesNotSavedAndAsk(
            (isDontAskAgain) =>
            {
                this.save(resolve);
                if (isDontAskAgain)
                    this.configService.setIsHideSaveMessage(isDontAskAgain);
            },
            () =>
            {
                if (this.getIsNewRow())
                    this.deleteNewRow();
                else
                    this.undo(resolve);
            },
            reject);
    }
    handleEmptyNewRow(isWait: boolean = false)
    {
        if (this.getIsChangesSavedAndNewRow())
        {
            // The timeout is a workaround for ios - toast is not displayed while a modal is closing.
            let time = this.strings.platform === 'ios' && isWait ? 500 : 0;
            setTimeout(() =>
            {
                this.messageHandler.showToast(this.strings.cannotGoToSubForm);
            }, time);

            return true;
        }
        return false;
    }
    /* Subforms */
    setSubformActions = (actions) =>
    {
        if (this.currentSubFormOpts.name)
        {
            let subform = this.formService.getForm(this.currentSubFormOpts.name + this.form.path);
            // !! TEXT FORMS ONLY !!
            // Assigns values to 'currentSubFormOpts' for rerendering. 
            // If the local 'ishtml' equals to 'subform.ishtml' - there is no need to rerender.
            // If the subform is a query form - always rerender. 
            if (this.formService.isTextForm(subform) && (this.formService.isQueryForm(subform) || !this.currentSubFormOpts.ishtml))
            {
                this.currentSubFormOpts =
                    {
                        name: this.currentSubFormOpts.name,
                        ishtml: true,
                        actions: actions
                    };
            }
            else
            {
                this.currentSubFormOpts.actions = actions;
            }

        }

    }
    subformSelected = (subform) =>
    {
        // Navigating to a subform is forbidden when no changes were made to a new row.
        if (this.handleEmptyNewRow())
            return;

        this.checkForChanges(true)
            .then(() =>
            {
                if (subform.name === this.form.name)
                {
                    // render parent details
                    this.currentSubFormOpts = { name: null, actions: {} };
                }
                else if (subform.name !== this.currentSubFormOpts.name)
                {
                    // render subform list
                    let subformConfig = this.formService.getFormConfig(subform, this.form);
                    this.currentSubFormOpts = { name: subform.name, ishtml: subformConfig.ishtml, actions: {} };
                }
            })
            .catch(() => { });

    }

    editSubFormRow = (form: Form, rowTitle: string, rowIndex: number) =>
    {
        this.formService.setActiveRow(form, rowIndex).catch(() => { });

        this.props.navigation.navigate(Pages.Details.name,
            {
                title: rowTitle,
                itemIndex: rowIndex,
                formPath: form.path,
            });
    }

    /* Direct activations */
    getActivationsList()
    {
        let actsArr = this.formConfig.activations;
        let deleteOption: DirectActivation =
            {
                type: this.strings.removeBtnType,
                name: this.strings.removeBtnType,
                title: this.strings.deleteBtnText
            };

        actsArr[this.strings.removeBtnType] = deleteOption;
        return Object.keys(actsArr).map((actName, index, arr) => actsArr[actName]);
    }
    openActivationsList = () =>
    {
        this.dropdown.show()
    }
    activationSelected(idx, act)
    {
        // Executing a direct activation is forbidden when no changes were made to a new row.
        if (this.handleEmptyNewRow(true))
            return;

        if (act.type !== this.strings.removeBtnType)
        {
            this.checkForChanges()
                .then(() =>
                {
                    this.messageHandler.showLoading(this.strings.loadData);
                    this.formService.executeDirectActivation(this.form, act.name, act.type).then(
                        (data) =>
                        {
                            this.messageHandler.hideLoading()
                        },
                        (reason) => this.messageHandler.hideLoading())
                })
                .catch(() => { });
        }
        else
        {
            this.deleteRow();
        }
    }
    deleteRow()
    {
        let delFunc = () =>
        {
            this.messageHandler.showLoading();
            this.formService.deleteRow(this.form)
                .then(() =>
                {
                    this.messageHandler.hideLoading();
                    this.goBack();
                })
                .catch(() => this.messageHandler.hideLoading());
        };
        this.messageHandler.showErrorOrWarning(false, this.strings.isDelete, delFunc);
    }
    deleteNewRow()
    {
        this.messageHandler.showLoading();
        this.formService.deleteRow(this.form)
            .then(() =>
            {
                this.messageHandler.hideLoading();
                this.navigateBack();
            })
            .catch(() => this.messageHandler.hideLoading());
    }
    save(afterSaveFunc = null)
    {
        if (this.handleEmptyNewRow())
            return;
        if (this.getIsChangesSaved())
        {
            this.goBack();
            return;
        }

        if (this.currentSubFormOpts.actions.save)
            this.currentSubFormOpts.actions.save(afterSaveFunc);
        else
            this.saveRow(afterSaveFunc);
    }
    saveRow(afterSaveFunc = null)
    {
        this.messageHandler.showLoading();
        this.formService.saveRow(this.form, this.itemIndex)
            .then(() =>
            {
                this.messageHandler.hideLoading();
                if (afterSaveFunc)
                    afterSaveFunc();
                this.messageHandler.showToast(this.strings.changesSavedText);
            })
            .catch(() => this.messageHandler.hideLoading());
    }
    undo(afterUndoFunc = null)
    {
        if (this.currentSubFormOpts.actions.undo)
            this.currentSubFormOpts.actions.undo(afterUndoFunc);
        else
            this.undoRow(afterUndoFunc);
    }
    undoRow = (afterUndoFunc = null) =>
    {
        this.messageHandler.showLoading();
        this.formService.undoRow(this.form, this.itemIndex)
            .then(() =>
            {
                this.messageHandler.hideLoading();
                if (afterUndoFunc)
                    afterUndoFunc();
            })
            .catch(() => this.messageHandler.hideLoading());
    }
    render() 
    {
        return (
            < View style={[container, styles.container]} >
                <HeaderComp title={this.title} goBack={() => this.focusAndPressIcon(this.goBack)} optionsComp={this.renderOperationsIcons()} />
                <View style={container}>
                    {this.renderSubFormsMenu()}
                    {this.currentSubFormOpts.name ? this.renderSubformsList() : this.renderParentDetails()}
                </View>
            </View >
        );
    }
    renderParentDetails()
    {
        return (
            <View>
                {this.rendertActivations()}
                <KeyboardAwareScrollView keyboardOpeningTime={0}>
                    {
                        Object.keys(this.columns).map(
                            (fieldName, index, arr) =>
                            {
                                if (!this.form.columns[fieldName] || !this.form.columns[fieldName])
                                    return (null);
                                return (<ItemInput key={fieldName}
                                    formPath={this.form.path}
                                    itemIndex={this.itemIndex}
                                    colName={fieldName}
                                    itemOptions={{
                                        navigation: this.getNavigation(fieldName),
                                        isFirst: index === 0,
                                        isLast: index === arr.length - 1
                                    }}
                                />);
                            }
                        )
                    }
                </KeyboardAwareScrollView>
            </View>
        );
    }

    /**
     * Renders rows of a selected subform.
     * @returns
     * @memberof DetailsPage
     */
    renderSubformsList()
    {
        return (
            <FormList
                formName={this.currentSubFormOpts.name}
                parentPath={this.form.path}
                editRow={this.editSubFormRow}
                formActions={this.setSubformActions}
            />
        );
    }

    /**
     * Renders subforms menu at the top.
     * @returns
     * @memberof DetailsPage
     */
    renderSubFormsMenu()
    {
        let currentForm =
            {
                name: this.form.name,
                title: this.form.title
            };
        let subforms = [currentForm, ...this.formConfig.subforms];
        return (
            <HorizontalList
                list={subforms}
                selected={this.currentSubFormOpts.name || this.form.name}
                onPress={this.subformSelected}
                inverted={this.strings.isRTL}
                showsHorizontalScrollIndicator={this.strings.platform !== 'android'}
            />
        )
    }
    /* Direct Activations */
    renderOperationsIcons()
    {
        let isShowSave = true;
        let isShowActivations = true;
        let afterSave = this.goBack;

        if (this.formService.isQueryForm(this.form))
        {
            let numOfActs = Object.keys(this.formConfig.activations).length;
            isShowSave = false;
            // Hide activations icon for query forms in case the only activation is a 'Delete' option.
            isShowActivations = numOfActs > 1 || numOfActs === 1 && this.formConfig.activations[this.strings.removeBtnType] == null;
        }

        if (this.currentSubFormOpts.name)
        {
            afterSave = null;

            // Show save icon only for text subforms.
            if (this.currentSubFormOpts.ishtml)
            {
                let subform = this.formService.getForm(this.currentSubFormOpts.name + this.form.path);
                isShowSave = !this.formService.isQueryForm(subform);
                isShowActivations = false;
            }
            else
            {
                return ({});
            }
        }

        return (
            <View style={flexDirection(this.strings.isRTL)}>
                {
                    isShowSave && <Icon
                        type='ionicon'
                        name={iconNames.checkmark}
                        onPress={() => this.focusAndPressIcon(() => this.save(afterSave))}
                        color='white'
                        underlayColor='transparent'
                        size={22}
                        containerStyle={[styles.optionsIcon, margin(!this.strings.isRTL, scale(-20))]}
                    />
                }
                {
                    isShowActivations && <Icon
                        type='ionicon'
                        name={iconNames.menu}
                        onPress={this.openActivationsList}
                        color='white'
                        underlayColor='transparent'
                        size={22}
                        containerStyle={[styles.optionsIcon, margin(!this.strings.isRTL, scale(-20))]}
                    />
                }

            </View>
        );

    }

    rendertActivations = () => (
        <ModalDropdown
            ref={el => this.dropdown = el}
            textStyle={{ height: 0 }}
            dropdownStyle={styles.dropdownStyle}
            renderSeparator={() => { }}
            options={this.getActivationsList()}
            renderRow={this.renderActivationRow}
            onSelect={(idx, value) => this.activationSelected(idx, value)}
            adjustFrame={(style) => this.getActivationsStyle(style)}
        />
    )
    renderActivationRow = (act, sectionID, rowID, highlightRow) =>
    {
        let color = act.type === this.strings.removeBtnType ? 'red' : colors.darkGray;
        return (
            <Text style={[styles.activationText, { color: color }, textAlign(this.strings.isRTL)]}>{act.title}</Text>
        );
    }
    getActivationsStyle(style)
    {
        return {
            backgroundColor: 'rgba(0,0,0,0.22)',
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: style.top
        }
    }
}

/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: 'white',
        },
    dropdownStyle: {
        width: "100%",
        backgroundColor: 'transparent',
        borderWidth: 0
    },
    activationText: {
        paddingHorizontal: 6,
        paddingVertical: 10,
        fontSize: 15,
        color: colors.darkGray,
        backgroundColor: 'white',
        textAlignVertical: 'center',
    },
    optionsIcon:
        {
            paddingVertical: 30,
            paddingHorizontal: scale(20),
            ...Platform.select({
                ios:
                    {
                        paddingTop: scale(35)
                    }
            })
        }
});
