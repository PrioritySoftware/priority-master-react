import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Image, Text, StyleSheet, Platform } from 'react-native';
import DatePicker from './DatePicker/datePicker';
import moment from 'moment';
import { scale } from '../../utils/scale';
import { colors } from '../../styles/common';
import { Icon } from 'react-native-elements';

@observer
export default class DateControl extends Component<any, any>

{
    static propTypes = {
        value: PropTypes.string.isRequired,
        format: PropTypes.string.isRequired,
        onUpdate: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        direction: PropTypes.string.isRequired,
        mode: PropTypes.string
    };
    static defaultProps =
        {
            mode: 'date',
            value:''
        };

    @observable selectedDate;
    @observable formatedDate;

    constructor(props)
    {
        super(props);
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
            this.formatedDate = this.selectedDate || '';
            newValue = date || '';
        }
        const { onUpdate, value } = this.props;
        if (newValue !== value)
        {
            onUpdate(newValue);
        }
    }

    render()
    {
        let flexDirection = this.props.direction === 'right' ? 'row-reverse' : 'row';
        let iconName = this.props.mode === 'date' ? 'calendar' : 'time';
        let OSprefix = Platform.OS === 'android' ? 'md' : 'ios';
        iconName = OSprefix + "-" + iconName;
        let iconColor = this.props.disabled ? colors.gray : colors.darkGray;
        let textColor = this.props.disabled ? colors.disabledGray : colors.darkGray;
        return (
            <DatePicker
                containerStyle={[styles.container, { flexDirection: flexDirection }]}
                initialDate={this.selectedDate}
                mode={this.props.mode}
                onDone={this.handleChange}
                disabled={this.props.disabled}
            >
                <Text
                    style={[
                        styles.text,
                        {
                            textAlign: this.props.direction,
                            color: textColor
                        }]}>
                    {this.formatedDate}
                </Text>
                <Icon type='ionicon' name={iconName} color={iconColor} />
            </DatePicker>
        )
    }
}
let styles = StyleSheet.create({
    container:
        {
            borderBottomWidth: 1,
            borderBottomColor: colors.middleGray,
            marginHorizontal: 3,
            marginBottom: 10,
            paddingTop: 4.5,
            paddingBottom: 3.5,
        },
    iconStyle:
        {
            width: scale(16),
            height: scale(24),
            resizeMode: 'contain',
        },

    text:
        {
            flex: 1,
            fontWeight: 'bold'
        }
});