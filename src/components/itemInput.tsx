import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
    View,
    Platform,
    Linking
} from 'react-native';
import TextControl from './Controls/textControl';
import { FormService } from '../providers/form.service';
import { Form } from '../modules/index';
import { observer, inject } from 'mobx-react';
import DateControl from './Controls/dateControl';
import { Column } from '../modules/column.class';
import { FormLabel, Icon } from 'react-native-elements'
import { scale, verticalScale } from '../utils/scale';
import NumberControl from './Controls/numberControl';
import ToggleControl from './Controls/toggleControl';
import { ColumnOptions } from '../modules/columnOptions.class';
import Communications from 'react-native-communications';
import DurationControl from './Controls/durationControl';
import { Pages } from '../pages/index';
import { MessageHandler } from './message.handler';
import { Strings } from '../modules/strings';
import { colors, iconName } from '../styles/common';

@inject("formService", "messageHandler", "strings")
@observer
export class ItemInput extends Component<any, any>
{
    static propTypes =
        {
            formPath: PropTypes.string.isRequired,
            parentForm: PropTypes.any,
            colName: PropTypes.string.isRequired,
            itemIndex: PropTypes.number.isRequired,
            itemOptions: PropTypes.object
        };
    static defaultProps =
        {
            itemOptions: {}
        };
    formService: FormService;
    messageHandler: MessageHandler;
    strings: Strings;

    // props
    form: Form;
    parentForm;
    colName: string;
    itemIndex: number;
    item;
    formCol: Column;
    colConfig: ColumnOptions;
    value: string;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;
        this.messageHandler = this.props.messageHandler;
        this.strings = this.props.strings;

        this.form = this.formService.getForm(this.props.formPath);
        this.parentForm = { name: this.props.parentName };
        this.colName = this.props.colName;
        this.itemIndex = this.props.itemIndex;
        this.item = this.formService.getFormRow(this.form, this.itemIndex);
        this.formCol = this.form.columns[this.props.colName];
        this.colConfig = this.formService.getFormConfig(this.form, this.parentForm).detailsColumnsOptions[this.colName];
    }
    isReadonly(): boolean
    {
        return this.form.isquery === 1 || this.formCol.readonly === 1;
    }

    // Returns if column is date or time type
    isDateOrTimeColumn()
    {
        return this.formCol.type === "date" || (this.formCol.type === "time" && this.formCol.maxLength === 5);
    }
    isBoolColumn()
    {
        return this.formCol.type === "bool";
    }

    isSearch()
    {
        return (this.formCol.zoom === "Search" || this.formCol.zoom === "Choose") && !this.isBoolColumn() && !this.isReadonly();
    }

    isBarcode()
    {
        return this.colConfig.subtype === "barcode";
    }

    isAttach()
    {
        return this.formCol.zoom === "Attach";
    }

    isPhone()
    {
        return this.colConfig.subtype === "phone";
    }

    isUrl()
    {
        return this.formCol.zoom === "URL";
    }

    isEmail()
    {
        return this.formCol.zoom === "EMail";
    }

    getIconName()
    {
        if (this.isBarcode())
            return iconName("barcode");
        if (this.isPhone())
            return iconName("call");
        if (this.isUrl())
            return iconName("link");
        if (this.isEmail())
            return iconName("mail");
        if (this.isSearch())
            return "ios-arrow-down";
        if (this.isAttach() && (!this.isReadonly() || this.value))
            return iconName("attach");
        return '';
    }
    // field operations
    updateField = (newValue: string) =>
    {
        this.formService.updateField(this.form, this.itemIndex, this.colName, newValue)
            .catch(error =>
            {
                this.formService.updateField(this.form, this.itemIndex, this.colName, this.value).catch(() => { });
            });
    }
    saveRow()
    {
        this.formService.saveRow(this.form, this.itemIndex)
            .then(() =>
            {
            })
            .catch(() => { });
    }
    // icons
    iconClick()
    {
        if (this.isBarcode())
        {
            this.scan();
        }
        else if (this.isAttach())
        {
        }
        else if (this.isPhone())
        {
            Communications.phonecall(this.value, false);
        }
        else if (this.isEmail())
        {
            Communications.email([this.value], null, null, null, null);
        }
        else if (this.isUrl())
        {
            if (this.value)
            {
                let prefix = 'http://';
                Linking.openURL(encodeURI(prefix + this.value));
            }
        }
        if (this.isSearch())
        {
            let { navigation } = this.props.itemOptions;
            if (!navigation)
                return;
            navigation.navigate(Pages.Search.name, {
                formPath: this.form.path,
                searchVal: this.value,
                colName: this.colName,
                onUpdate: this.updateField
            });
        }
    }
    // barcode scanning
    scan()
    {
        let { navigation } = this.props.itemOptions;
        if (!navigation)
            return;
        navigation.navigate(Pages.QRCodeScanner.name, { onRead: this.scanFinished });
    }
    scanFinished = (data) =>
    {
        if (data == undefined || data === "")
        {
            this.messageHandler.showToast(this.strings.scanError, true);
        }
        else
        {
            this.updateField(data);
        }
    }
    // rendering
    render()
    {
        this.value = this.item.get(this.colName);
        let { isFirst, isLast } = this.props.itemOptions;
        let mandatoryDisplay = this.formCol.mandatory === 1 ? 'flex' : 'none';
        let labelColor = this.isReadonly() ? colors.gray : colors.disabledGray;
        let containerMargin = isFirst ? { marginTop: verticalScale(10) } : isLast ? { marginBottom: verticalScale(20) } : {};
        return (
            <View style={[styles.container, containerMargin]}>
                <View style={{ flexDirection: this.strings.flexDir }}>
                    <FormLabel labelStyle={[styles.labelStyle, { color: labelColor }]}>{this.formCol.title} </FormLabel>
                    <Icon type='material-community'
                        name='asterisk'
                        color='red'
                        size={10}
                        style={[styles.asterisk, { display: mandatoryDisplay }]} />
                </View>
                {this.renderControl()}
            </View>
        );

    }
    renderControl()
    {
        switch (this.formCol.type)
        {
            case 'time':
            case 'date':
                {
                    if (this.isDateOrTimeColumn())
                        return this.renderDateControl();
                    return this.renderDurationControl();
                }
            case 'number':
                return this.renderNumberControl();
            case 'bool':
                return this.renderToggleControl();
            default:
                return this.renderTextControl();
        }
    }
    renderTextControl()
    {
        return (
            <TextControl key={this.colName}
                value={this.value}
                disabled={this.isReadonly()}
                maxLength={this.formCol.maxLength}
                onUpdate={this.updateField}
                icon={this.getIconName()}
                iconClick={() => this.iconClick()}
            />
        );
    }
    renderDateControl()
    {
        return (
            <DateControl key={this.colName}
                value={this.value}
                format={this.formCol.format}
                mode={this.formCol.type}
                disabled={this.isReadonly()}
                onUpdate={this.updateField}
            />
        );
    }
    renderNumberControl()
    {
        return (
            <NumberControl key={this.colName}
                value={this.value}
                maxLength={this.formCol.maxLength}
                decimal={this.formCol.decimal}
                prefix=''
                code={this.formCol.code}
                disabled={this.isReadonly()}
                onUpdate={this.updateField}
            />
        );
    }
    renderToggleControl()
    {
        return (
            <ToggleControl key={this.colName}
                value={this.value}
                disabled={this.isReadonly()}
                onUpdate={this.updateField}
            />
        );
    }
    renderDurationControl()
    {
        return (
            <DurationControl key={this.colName}
                value={this.value}
                maxLength={this.formCol.maxLength}
                disabled={this.isReadonly()}
                onUpdate={this.updateField}

            />
        );
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
    container: {
        marginLeft: 15,
        marginRight: 15,
        ...Platform.select({
            ios:
                {
                    marginLeft: 20,
                    marginRight: 20,
                },
        }),
    },
    labelStyle:
        {
            fontWeight: 'normal',
            marginTop: scale(10),
            marginLeft: 0,
            marginRight: 0,
            ...Platform.select({
                ios:
                    {
                        marginLeft: 5,
                        marginRight: 5,
                    },
            }),
        },
    asterisk:
        {
            marginTop: verticalScale(10),
            marginHorizontal: 1
        }
});