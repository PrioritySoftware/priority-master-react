import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, Platform } from 'react-native';
import DatePicker from './DatePicker/datePicker';
import moment from 'moment';
import { colors, textAlign, flexDirection, opacityOff } from '../../styles/common';
import { Icon } from 'react-native-elements';
import { Strings } from '../../modules/strings';

@inject("strings")
@observer
export default class DateControl extends Component<any, any>

{
    static propTypes = {
        value: PropTypes.string.isRequired,
        format: PropTypes.string.isRequired,
        onUpdate: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        mode: PropTypes.string,
        inputStyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ]),
    };
    static defaultProps =
        {
            mode: 'date',
            value: ''
        };

    strings: Strings;

    @observable selectedDate;
    @observable formatedDate;

    constructor(props)
    {
        super(props);
        this.strings = this.props.strings;
        if (props.mode === 'date')
        {
            this.selectedDate = props.value !== '' ? new Date(props.value) : null;
            this.formatedDate = this.selectedDate ? moment(this.selectedDate).format(this.props.format) : '';
        }
        else
        {
            this.selectedDate = props.value !== '' ? props.value : null;
            this.formatedDate = this.selectedDate ? this.selectedDate : '';
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.props.mode === 'date')
        {
            const prevDate = this.selectedDate ? this.selectedDate.toISOString() : '';
            if (prevDate !== nextProps.value)
            {
                this.selectedDate = nextProps.value !== '' ? new Date(nextProps.value) : null;
                this.formatedDate = this.selectedDate ? moment(this.selectedDate).format(this.props.format) : '';
            }
        }
        else
        {
            const prevDate = this.selectedDate ? this.selectedDate : '';
            if (prevDate !== nextProps.value)
            {
                this.selectedDate = nextProps.value !== '' ? nextProps.value : null;
                this.formatedDate = this.selectedDate ? this.selectedDate : '';
            }
        }
    }
    getTimeString(hour: number, minute: number)
    {
        let hourStr = hour < 10 ? ('0' + hour) : hour;
        let minuteStr = minute < 10 ? ('0' + minute) : minute;
        return hourStr + ":" + minuteStr;
    }
    handleChange(date)
    {
        this.selectedDate = date;
        let newValue;
        if (this.props.mode === 'date')
        {
            this.formatedDate = this.selectedDate ? moment(this.selectedDate).format(this.props.format) : '';
            // We convert the date to ISO using the format method because the toISOString function converted the date to the day before
            newValue = date == null ? '' : moment(date).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
        else
        {
            // IOS - time picker value returns as a date string.
            let datetime = new Date(date);
            if (date && !isNaN(datetime.getTime()))
                date = this.getTimeString(datetime.getHours(), datetime.getMinutes());

            newValue = this.formatedDate = date || '';
        }
        const { onUpdate, value } = this.props;
        if (newValue !== value)
        {
            onUpdate(newValue);
        }
    }

    render()
    {
        let iconName = this.props.mode === 'date' ? 'calendar' : 'time';
        let OSprefix = Platform.OS === 'android' ? 'md' : 'ios';
        iconName = OSprefix + "-" + iconName;
        let opacity = this.props.disabled ? opacityOff : 1;
        return (
            <DatePicker
                containerStyle={[styles.container, flexDirection(this.strings.isRTL)]}
                initialDate={this.selectedDate}
                mode={this.props.mode}
                onDone={this.handleChange}
                disabled={this.props.disabled}
                cancelText={this.strings.cancel}
                doneText={this.strings.done}
                clearText={this.strings.clear}

            >
                <Text style={[this.props.inputStyle,styles.text, textAlign(this.strings.isRTL)]}>
                    {this.formatedDate}
                </Text>
                <Icon type='ionicon' name={iconName} size={23} color={colors.darkGray} style={{ opacity: opacity}} />
            </DatePicker>
        )
    }
}
let styles = StyleSheet.create({
    container:
        {
            borderBottomWidth: 1,
            borderBottomColor: colors.gray,
            paddingHorizontal: 2.5,
            marginBottom:8,
            paddingTop: 4.5,
            paddingBottom: 3.5,
        },

    text:
        {
            flex: 1,
            marginTop:2,
            ...Platform.select({
                ios:
                    {
                          marginBottom:-3
                    }
            })
        }
});