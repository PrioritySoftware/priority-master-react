import React from 'react';
import
{
    StyleSheet,
    View,
    Text,
    Platform,
    BackHandler,

} from 'react-native';
import { container, colors, iconNames, textAlign, margin, flexDirection } from '../styles/common';
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

@inject("formService", "strings", "procService", "configService")
@observer
export class DetailsPage extends React.Component<any, any>
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

    @observable currentSubForm: string;
    dropdown;

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
    }
    componentDidMount()
    {
        this.messageHandler = Messages;
        BackHandler.addEventListener('hardwareBackPress', this.goBack);
    }
    isSearch(formCol: Column)
    {
        return formCol.zoom === "Search" || formCol.zoom === "Choose";
    }
    setIsChangesSaved(isSaved: boolean)
    {
        this.formService.setIsRowChangesSaved(this.form, this.itemIndex, isSaved);
    }
    getIsChangesSaved()
    {
        return this.formService.getIsRowChangesSaved(this.form, this.itemIndex);
    }
    getIsNewRow()
    {
        return this.formService.getIsNewRow(this.form, this.itemIndex);
    }
    goBack = () =>
    {
        // When there are no changes made for a new row, delete the row before navigating back.
        if (this.getIsChangesSaved() && this.getIsNewRow())
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
            () => this.saveRow(resolve),
            () =>
            {
                if (this.getIsNewRow())
                    this.deleteNewRow();
                else
                    this.undoRow(resolve);
            },
            reject);
    }
    showChangesNotSavedAndAsk(resolve, reject)
    {
        if (this.configService.getIsHideSaveMessage())
        {
            this.saveRow(resolve);
            return;
        }
        this.messageHandler.showChangesNotSavedAndAsk(
            (isDontAskAgain) =>
            {
                this.saveRow(resolve);
                if (isDontAskAgain)
                    this.configService.setIsHideSaveMessage(isDontAskAgain);
            },
            () =>
            {
                if (this.getIsNewRow())
                    this.deleteNewRow();
                else
                    this.undoRow(resolve);
            },
            reject);
    }
    /* Subforms */

    subformSelected = (subform) =>
    {
        this.checkForChanges(true)
            .then(() =>
            {
                // render parent details
                if (subform.name === this.form.name)
                    this.currentSubForm = null;
                else
                    this.currentSubForm = subform.name;
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
    undoRow = (afterUndoFunc = null) =>
    {
        this.messageHandler.showLoading();
        this.formService.undoRow(this.form)
            .then(() =>
            {
                this.messageHandler.hideLoading();
                this.setIsChangesSaved(true);
                if (afterUndoFunc)
                    afterUndoFunc();
            })
            .catch(() => this.messageHandler.hideLoading());
    }
    render() 
    {
        let optionsComp = this.currentSubForm ? {} : this.renderSideMenuIcon();
        return (
            < View style={[container, styles.container]} >
                <HeaderComp title={this.title} goBack={() => this.goBack()} optionsComp={optionsComp} />
                {this.renderSubFormsMenu()}
                {this.currentSubForm ? this.renderSubformsList() : this.renderParentDetails()}
            </View >
        );
    }
    renderParentDetails()
    {
        return (
            <View style={[container]}>
                {this.rendertActivations()}
                <KeyboardAwareScrollView keyboardOpeningTime={0} style={{ flex: 0.88 }}>
                    {
                        Object.keys(this.columns).map(
                            (fieldName, index, arr) =>
                                <ItemInput key={fieldName}
                                    formPath={this.form.path}
                                    itemIndex={this.itemIndex}
                                    colName={fieldName}
                                    itemOptions={{
                                        navigation: this.getNavigation(fieldName),
                                        isFirst: index === 0,
                                        isLast: index === arr.length - 1
                                    }}

                                />
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
                formName={this.currentSubForm}
                parentPath={this.form.path}
                editRow={this.editSubFormRow}
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
                selected={this.currentSubForm || this.form.name}
                onPress={this.subformSelected}
                inverted={this.strings.isRTL}
                showsHorizontalScrollIndicator={this.strings.platform !== 'android'}
            />
        )
    }
    /* Direct Activations */

    renderSideMenuIcon()
    {
        return (
            <View style={flexDirection(this.strings.isRTL)}>
                <Icon
                    type='ionicon'
                    name={iconNames.checkmark}
                    onPress={() => this.saveRow(this.goBack)}
                    color='white'
                    underlayColor='transparent'
                    size={22}
                    containerStyle={[styles.optionsIcon, margin(!this.strings.isRTL, scale(-20))]}
                />
                <Icon
                    type='ionicon'
                    name={iconNames.menu}
                    onPress={this.openActivationsList}
                    color='white'
                    underlayColor='transparent'
                    size={22}
                    containerStyle={[styles.optionsIcon, margin(!this.strings.isRTL, scale(-20))]}
                />


            </View>
        );

    }

    rendertActivations = () => (
        <ModalDropdown
            ref={el => this.dropdown = el}
            textStyle={{ height: 0 }}
            dropdownStyle={styles.dropdownStyle}
            style={styles.dropdown}
            renderSeparator={() => { }}
            options={this.getActivationsList()}
            renderRow={this.renderActivationRow}
            onSelect={(idx, value) => this.activationSelected(idx, value)}
        />
    )
    renderActivationRow = (act, sectionID, rowID, highlightRow) =>
    {
        let color = act.type === this.strings.removeBtnType ? 'red' : colors.darkGray;
        return (
            <Text style={[styles.activationText, { color: color }, textAlign(this.strings.isRTL)]}>{act.title}</Text>
        );
    }
}

/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: 'white',
        },
    dropdown: {
        margin: 0,
        width: 0,
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
            paddingVertical: scale(30),
            paddingHorizontal: scale(20),
            ...Platform.select({
                ios:
                    {
                        paddingTop: scale(35)
                    }
            })
        }
});
