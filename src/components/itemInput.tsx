import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
    View,
    Platform
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

@inject("formService")
@observer
export class ItemInput extends Component<any, any>
{
    static propTypes =
        {
            value: PropTypes.string.isRequired,
            form: PropTypes.object.isRequired,
            colName: PropTypes.string.isRequired,
            onUpdate: PropTypes.func.isRequired,
            direction: PropTypes.string
        };
    static defaultProps =
        {
            direction: 'left',
            value: ''
        };
    formService: FormService;

    // props
    form: Form;
    colName: string;
    formCol: Column;

    value: string;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;

        this.form = this.props.form;
        this.colName = this.props.colName;
        this.formCol = this.form.columns[this.props.colName];
        this.value = this.props.value;
    }
    componentWillReceiveProps(nextProps)
    {
        if (this.value !== nextProps.value)
        {
            this.value = nextProps.value;
        }
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

    render()
    {
        let flexDir = this.props.direction === 'right' ? 'row-reverse' : 'row';
        let mandatoryDisplay = this.formCol.mandatory === 1 ? 'flex' : 'none';
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: flexDir }}>
                    <FormLabel labelStyle={styles.labelStyle}>{this.formCol.title} </FormLabel>
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
        const { form, colName } = this.props;
        switch (form.columns[colName].type)
        {
            case 'time':
            case 'date':
                {
                    if (this.isDateOrTimeColumn())
                        return this.renderDateControl();
                    return this.renderTextControl();
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
                onUpdate={newVal => this.props.onUpdate(newVal)}
                direction={this.props.direction}
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
                onUpdate={newVal => this.props.onUpdate(newVal)}
                direction={this.props.direction}
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
                onUpdate={newVal => this.props.onUpdate(newVal)}
                direction={this.props.direction}
            />
        );
    }
    renderToggleControl()
    {
        return (
            <ToggleControl key={this.colName}
                value={this.value}
                disabled={this.isReadonly()}
                onUpdate={newVal => this.props.onUpdate(newVal)}
                direction={this.props.direction}
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