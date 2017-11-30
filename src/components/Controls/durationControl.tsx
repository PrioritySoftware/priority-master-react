import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Keyboard, StyleSheet, EmitterSubscription, View } from 'react-native';
import { verticalScale } from '../../utils/scale';
import { colors } from '../../styles/common';
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
        let textColor = this.props.disabled ? colors.disabledGray : colors.darkGray;
        return (
            <View style={{ flexDirection: this.strings.flexDir }}>
                <FormInput
                    textInputRef={textInput => this.textInput = textInput}
                    editable={!this.props.disabled}
                    keyboardType='numeric'
                    value={this.text}
                    maxLength={this.props.maxLength}
                    onChangeText={this.handleChange}
                    onBlur={this.handleEndEditing}
                    underlineColorAndroid={colors.gray}
                    containerStyle={styles.inputContainer}
                    inputStyle={[styles.input, { textAlign: this.strings.sideByLang, color: textColor }]}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    inputContainer:
        {
            marginTop: -10,
            marginLeft: 0,
            marginRight: 0,
        },
    input:
        {
            fontWeight: 'bold',
            minHeight: verticalScale(5),
            marginLeft: 0,
            marginRight: 0
        }
});
