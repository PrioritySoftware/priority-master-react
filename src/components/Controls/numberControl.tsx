import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import * as displayUtils from '../../utils/display';
import * as validationUtils from '../../utils/validation';
import { colors, flexDirection, textAlign, opacityOff } from '../../styles/common';
import { FormInput } from 'react-native-elements'
import { Strings } from '../../modules/strings';

@inject("strings")
@observer
export default class NumberControl extends Component<any, any> {

    static defaultProps = {
        prefix: '',
        placeholder: '',
        value: ''
    }

    static propTypes = {
        value: PropTypes.any.isRequired,
        maxLength: PropTypes.number.isRequired,
        decimal: PropTypes.number.isRequired,
        prefix: PropTypes.string,
        code: PropTypes.string,
        onUpdate: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool,
        containerStyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ]),
        inputStyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ]),
    }

    strings: Strings;

    @observable number;
    @observable inputLength;

    constructor(props)
    {
        super(props);

        this.strings = this.props.strings;

        this.number = props.prefix + displayUtils.number(props.value, props.code === 'Real' ? props.decimal : 0);
        this.inputLength = this.calcInputLength(this.number);
        this.handleChange = this.handleChange.bind(this);
        this.handleEndEditing = this.handleEndEditing.bind(this);
    }

    componentWillReceiveProps(nextProps)
    {
        const num = this.number.substring(this.props.prefix.length);
        if (num !== nextProps.value)
        {
            this.number = nextProps.prefix + displayUtils.number(nextProps.value, nextProps.code === 'Real' ? nextProps.decimal : 0);
            this.inputLength = this.calcInputLength(this.number);
        }
    }

    calcInputLength(num)
    {
        const { maxLength, decimal } = this.props;

        if (num.indexOf('.') > -1)
        {
            return num.indexOf('.') + 1;
        }

        return maxLength - decimal;
    }

    handleChange(num)
    {
        const { prefix, decimal, maxLength, code, positive } = this.props;

        let valid = true;

        if (num.length < prefix.length) return;

        this.inputLength = this.calcInputLength(num);

        const value = prefix ? num.substring(prefix.length) : num;

        if (value.indexOf('-') === 0 && positive || value.indexOf('-') > 0)
        {
            valid = false;
        }

        if (validationUtils.number(value, maxLength, decimal, code) && valid)
        {
            this.number = num;
        }
    }

    handleEndEditing()
    {
        const { onUpdate, value, prefix, decimal, code } = this.props;
        const num = this.number.substring(prefix.length);
        if (num !== value.toString())
        {
            onUpdate(displayUtils.number(Number(num.replace(',', '')), code === 'Real' ? decimal : 0));
        }
    }

    render()
    {
        return (
            <FormInput
                placeholder={this.props.placeholder}
                editable={!this.props.disabled}
                keyboardType='numeric'
                value={this.number}
                maxLength={this.props.maxLength}
                onChangeText={this.handleChange}
                onEndEditing={this.handleEndEditing}
                underlineColorAndroid='transparent'
                containerStyle={[this.props.containerStyle, flexDirection(this.strings.isRTL)]}
                inputStyle={[this.props.inputStyle, textAlign(this.strings.isRTL)]}
            />
        )
    }
}
