import React from 'react';
import
{
    FlatList,
    StyleSheet,
    View,
    Text,
    Platform,

} from 'react-native';
import { ConfigService } from '../providers/config.service';
import { container, colors, iconNames, textAlign, margin } from '../styles/common';
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
import { MessageHandler } from '../components/message.handler';
import { HorizontalList } from '../components/horizontalList'
import { FormConfig } from '../modules/formConfig.class';
import { DirectActivation } from '../modules/directActivation.class';
import { observable } from 'mobx';
import { FormList } from '../components/formList.comp';
import { scale } from '../utils/scale';

@inject("formService", "strings", "configService", "procService", "messageHandler")
@observer
export class DetailsPage extends React.Component<any, any>
{
    static navigationOptions = { header: null }

    formService: FormService;
    configService: ConfigService;
    procService: ProcService;
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
        this.strings = this.props.strings;
        this.procService = this.props.procService
        this.configService = this.props.configService;
        this.messageHandler = this.props.messageHandler;

        this.title = this.props.navigation.state.params.title;
        this.form = this.formService.getForm(this.props.navigation.state.params.formPath);
        let parentForm = { name: this.form.parentName };
        this.formConfig = this.formService.getFormConfig(this.form, parentForm);
        this.columns = this.formConfig.detailsColumnsOptions;
        this.itemIndex = this.props.navigation.state.params.itemIndex;
    }
    goBack()
    {
        this.props.navigation.goBack();
    }
    isSearch(formCol: Column)
    {
        return formCol.zoom === "Search" || formCol.zoom === "Choose";
    }
    getNavigation(colName: string)
    {
        let colConfig = this.columns[colName];
        let col = this.form.columns[colName];
        if (colConfig.subtype === 'barcode' || this.isSearch(col))
            return this.props.navigation;
        return null;
    }

    /* Subforms */

    subformSelected = (subform) =>
    {
        // render parent details
        if (subform.name === this.form.name)
            this.currentSubForm = null;
        else
            this.currentSubForm = subform.name;
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
        this.messageHandler.showLoading(this.strings.loadData);
        if (act.type !== this.strings.removeBtnType)
        {
            this.formService.executeDirectActivation(this.form, act.name, act.type).then(
                (data) =>
                {
                    this.messageHandler.hideLoading()
                },
                (reason) => this.messageHandler.hideLoading())
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
            this.formService.deleteRow(this.form)
                .then(() =>
                {
                    this.messageHandler.hideLoading();
                    this.goBack();
                })
                .catch(() => this.messageHandler.hideLoading());
        };
        // IOS: Rendering an Alert while closing a Modal was freezing the application. The timeout is a workaround.
        setTimeout(() =>
        {
            this.messageHandler.showErrorOrWarning(false, this.strings.isDelete, delFunc);
        }, 5);

    }
    render()
    {
        let specialComponent = this.currentSubForm ? {} : this.renderSideMenuIcon();
        return (
            < View style={[container, styles.container]} >
                <HeaderComp title={this.title} goBack={() => this.goBack()} specialComponent={specialComponent} />
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
            />
        )
    }
    /* Direct Activations */

    renderSideMenuIcon()
    {
        return ({
            type: 'ionicon',
            icon: iconNames.menu,
            onPress: this.openActivationsList,
            color: 'white',
            underlayColor: 'transparent',
            style: [styles.activationsIconStyle, margin(!this.strings.isRTL, scale(-10))]
        });

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
        width: 100,
    },
    dropdownStyle: {
        width: "100%",
        backgroundColor: 'transparent',
    },
    activationText: {
        paddingHorizontal: 6,
        paddingVertical: 10,
        fontSize: 15,
        color: colors.darkGray,
        backgroundColor: 'white',
        textAlignVertical: 'center',
    },
    activationsIconStyle:
        {
            paddingVertical: scale(30),
            paddingHorizontal: scale(10),
            ...Platform.select({
                ios:
                    {
                        paddingTop: scale(35)
                    }
            })
        }
});
