import React, { Component } from 'react';
import
{
    StyleSheet,
    View,
    Platform,
    Linking,
    Text
} from 'react-native';
import PropTypes from 'prop-types';
import TextControl from './Controls/textControl';
import { FormService } from '../providers/form.service';
import { Form } from '../modules/index';
import { observer, inject } from 'mobx-react';
import DateControl from './Controls/dateControl';
import { Column } from '../modules/column.class';
import { FormLabel } from 'react-native-elements'
import { verticalScale } from '../utils/scale';
import NumberControl from './Controls/numberControl';
import ToggleControl from './Controls/toggleControl';
import { ColumnOptions } from '../modules/columnOptions.class';
import { ColumnType } from '../modules/columnType.class';
import Communications from 'react-native-communications';
import DurationControl from './Controls/durationControl';
import { Pages } from '../pages/index';
import { Strings } from '../modules/strings';
import { colors, iconNames, flexDirection, opacityOff } from '../styles/common';
import { MessageHandler } from '../handlers/message.handler';
import { Messages, Files } from '../handlers';
import { Search } from '../modules/search.class';
import { FileHandler } from "../handlers/file.handler"
import { ColumnZoomType } from '../modules/columnZoomType.class';
import { ContextMenu } from './Menus/context-menu.comp';
import { RequestPermission } from '../handlers/permissions.handler';

@inject("formService", "strings")
@observer
export class ItemInput extends Component<any, any>
{
    static propTypes =
        {
            formPath: PropTypes.string.isRequired,
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
    fileHandler: FileHandler;
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

    attachContextMenu: ContextMenu;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;
        this.strings = this.props.strings;

        this.form = this.formService.getForm(this.props.formPath);
        this.parentForm = { name: this.form.parentName };
        this.colName = this.props.colName;
        this.itemIndex = this.props.itemIndex;
        this.item = this.formService.getFormRow(this.form, this.itemIndex);
        this.formCol = this.form.columns[this.props.colName];
        this.colConfig = this.formService.getFormConfig(this.form, this.parentForm).detailsColumnsOptions[this.colName];
    }
    componentDidMount()
    {
        this.messageHandler = Messages;
        this.fileHandler = Files;
    }
    isReadonly(): boolean
    {
        return this.form.isquery === 1 || this.formCol.readonly === 1;
    }

    // Returns if column is date or time type
    isDateOrTimeColumn()
    {
        return this.formCol.type === ColumnType.Date || (this.formCol.type === ColumnType.Time && this.formCol.maxLength === 5);
    }
    isBoolColumn()
    {
        return this.formCol.type === ColumnType.Bool;
    }

    isSearch()
    {
        return (this.formCol.zoom === ColumnZoomType.Search || this.formCol.zoom === ColumnZoomType.Choose) && !this.isBoolColumn() && !this.isReadonly();
    }

    isBarcode()
    {
        return this.colConfig.subtype === ColumnZoomType.Barcode;
    }

    isAttach()
    {
        return this.formCol.zoom === ColumnZoomType.Attach;
    }

    isPhone()
    {
        return this.colConfig.subtype === ColumnZoomType.Phone;
    }

    isUrl()
    {
        return this.formCol.zoom === ColumnZoomType.URL;
    }

    isEmail()
    {
        return this.formCol.zoom === ColumnZoomType.EMail;
    }

    getIconName()
    {
        if (this.isBarcode())
            return iconNames.barcode;
        if (this.isPhone())
            return iconNames.phone;
        if (this.isUrl())
            return iconNames.url;
        if (this.isEmail())
            return iconNames.email;
        if (this.isSearch())
            return iconNames.search;
        if (this.isAttach() && (!this.isReadonly() || this.value))
            return iconNames.attach;
        return '';
    }
    getOpacity()
    {
        return { opacity: this.isReadonly() ? opacityOff : 1 };
    }
    // field operations
    updateField = (newValue: string) =>
    {
        let oldVal = this.value || '';
        let oldChangesState = this.formService.getIsRowChangesSaved(this.form, this.itemIndex);
        this.formService.updateField(this.form, this.itemIndex, this.colName, newValue)
            .catch(error =>
            {
                this.formService.updateField(this.form, this.itemIndex, this.colName, oldVal)
                    .then(() => this.formService.setIsRowChangesSaved(this.form, this.itemIndex, oldChangesState))
                    .catch(() => { });
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

    /** Attachment treatment   */
    handleAttachments = (value) =>
    {
        if (value)
            this.attachContextMenu.open();
        else
            this.chooseFile();
    }
    openAttachment = () =>
    {
        Linking.openURL(encodeURI(this.form.getFileUrl(this.value)));
    }
    chooseFile = () =>
    {
        this.fileHandler.openPicker(this.form, this.updateField);
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
            this.handleAttachments(this.value)
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
        else if (this.isSearch())
        {
            this.search();
        }
    }
    // All 'hideLoading' in this message are for search after scanning.
    search()
    {
        let { navigation } = this.props.itemOptions;
        if (!navigation)
        {
            this.messageHandler.hideLoading();
            return;
        }
        let value = this.value || '';
        this.formService.openSearchOrChoose(this.form, this.colName, value).then(
            (res: Search) =>
            {
                let searchResults = res.SearchLine || res.ChooseLine;
                if (searchResults)
                {
                    this.messageHandler.hideLoading();
                    navigation.navigate(Pages.Search.name,
                        {
                            title: this.formCol.title,
                            searchVal: this.value,
                            searchObj: res,
                            formPath: this.form.path,
                            onUpdate: this.updateField
                        });
                }
                else
                {
                    this.messageHandler.hideLoading();
                }
            },
            reason => this.messageHandler.hideLoading());
    }
    // barcode scanning
    scan()
    {
        let { navigation } = this.props.itemOptions;
        if (!navigation)
            return;
        RequestPermission(this.strings.cameraPermission)
            .then(authorized =>
            {
                if (authorized)
                    navigation.navigate(Pages.QRCodeScanner.name, { onRead: this.scanFinished });
                else
                    this.messageHandler.showErrorOrWarning(true, this.strings.scanPermissionError);
            })
            .catch(error => this.messageHandler.showErrorOrWarning(true, this.strings.scanError));
    }
    scanFinished = (data, iscanceled) =>
    {
        if (iscanceled)
        {
            if (this.isSearch())
            {
                this.messageHandler.showLoading();
                setTimeout(() =>
                {
                    this.search();
                }, 0);

            }

            return;
        }
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
        let mandatoryDisplay: any = this.formCol.mandatory === 1 ? 'flex' : 'none';
        let containerMargin = isFirst ? { marginTop: 10 } : isLast ? { marginBottom: 50 } : {};
        let opacity = this.isReadonly() ? 0.6 : 1;
        return (
            <View style={[styles.container, containerMargin]}>
                <View style={flexDirection(this.strings.isRTL)}>
                    <FormLabel labelStyle={[styles.labelStyle, { color: colors.label, opacity: opacity }]}>{this.formCol.title} </FormLabel>
                    <Text style={[styles.asterisk, { display: mandatoryDisplay }]} >
                        *
                    </Text>
                </View>
                {this.renderControl()}
                {this.renderAttachContextMenu()}
            </View>
        );

    }
    renderControl()
    {
        switch (this.formCol.type)
        {
            case ColumnType.Time:
            case ColumnType.Date:
                {
                    if (this.isDateOrTimeColumn())
                        return this.renderDateControl();
                    return this.renderDurationControl();
                }
            case ColumnType.Number:
                return this.renderNumberControl();
            case ColumnType.Bool:
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
                type={this.formCol.zoom}
                disabled={this.isReadonly()}
                maxLength={this.formCol.maxLength}
                onUpdate={this.updateField}
                icon={this.getIconName()}
                iconClick={() => this.iconClick()}
                containerStyle={styles.inputContainer}
                inputStyle={[styles.input, this.getOpacity()]}
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
                inputStyle={[styles.input, this.getOpacity()]}
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
                containerStyle={styles.inputContainer}
                inputStyle={[styles.input, this.getOpacity()]}
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
                containerStyle={styles.inputContainer}
                inputStyle={[styles.input, this.getOpacity()]}
            />
        );
    }

    renderAttachContextMenu()
    {
        if (this.isAttach())
        {
            let menuItems = [
                {
                    text: this.strings.openBtnText,
                    onPress: this.openAttachment,
                },
                {
                    text: this.strings.addNewBtnText,
                    onPress: this.chooseFile,
                }
            ];
            return (<ContextMenu items={menuItems} onRef={menu => this.attachContextMenu = menu} />);
        }
        else
        {
            return (null);
        }
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
            fontSize: 12,
            fontWeight: 'normal',
            marginTop: 10,
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
            marginTop: 10,
            marginBottom: -5,
            marginHorizontal: 1,
            color: 'red',
            fontSize: 17
        },
    inputContainer:
        {
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 6,
            borderBottomWidth: 1,
            borderBottomColor: colors.gray,
            width: '100%',

        },
    input:
        {
            minHeight: 'auto',
            fontSize: 15,
            fontWeight: 'normal',
            marginLeft: 0,
            marginRight: 0,
            marginBottom: -10,
            marginTop: -2,
            color: colors.dark,
            ...Platform.select({
                ios:
                    {
                        marginBottom: 7,
                        marginRight:6,
                        marginLeft: 6,
                        marginTop: 5,
                    }
            })
        },
});