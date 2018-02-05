import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Keyboard, EmitterSubscription, } from 'react-native';
import { colors, flexDirection, textAlign, opacityOff } from '../../styles/common';
import { FormInput } from 'react-native-elements'
import { observable } from 'mobx';
import { Strings } from '../../modules/strings';

@inject("strings")
@observer
export default class DurationControl extends Component<any, any> {

    static propTypes =
        {
            value: PropTypes.string.isRequired,
            maxLength: PropTypes.number,
            onUpdate: PropTypes.func.isRequired,
            disabled: PropTypes.bool,
            direction: PropTypes.string,
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
        };
    static defaultProps =
        {
            value: '',
        };

    strings: Strings;

    @observable text: string;
    keyboardWillHideSub: EmitterSubscription;
    textInput;

    constructor(props)
    {
        super(props);
        this.strings = this.props.strings;
        this.text = props.value;
    }

    componentWillMount()
    {
        this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
    }

    componentWillUnmount()
    {
        this.keyboardWillHideSub.remove();
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.text !== nextProps.value)
        {
            this.text = nextProps.value;
        }
    }

    keyboardDidHide = (event) =>
    {
        // handle case were keyboard was closed by the android back button, were onBlur event is not fired
        if (this.textInput.isFocused())
        {
            this.handleEndEditing();
            this.textInput.blur();
        }
    }

    handleChange = (text: string) =>
    {
        if (this.text.endsWith(":") && text.length === 3)
            text = text.substr(0, 2);
        if (text.length === 3 && !text.includes(":"))
            text = text + ":";
        if ((text.length <= 3 || text.includes(":")) && !text.includes(".") && !text.includes("-"))
            this.text = text;
    }

    handleEndEditing = () =>
    {
        const { onUpdate, value } = this.props;
        if (this.text !== value)
        {
            onUpdate(this.text);
        }
    }

    render()
    {
        return (
            <FormInput
                textInputRef={textInput => this.textInput = textInput}
                editable={!this.props.disabled}
                keyboardType='numeric'
                value={this.text}
                maxLength={this.props.maxLength}
                onChangeText={this.handleChange}
                onBlur={this.handleEndEditing}
                underlineColorAndroid="transparent"
                containerStyle={[this.props.containerStyle, flexDirection(this.strings.isRTL)]}
                inputStyle={[this.props.inputStyle, textAlign(this.strings.isRTL)]}
            />
        )
    }
}
