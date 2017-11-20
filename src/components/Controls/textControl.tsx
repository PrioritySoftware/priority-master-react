import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { View, Keyboard, StyleSheet, EmitterSubscription } from 'react-native';
import { scale, verticalScale } from '../../utils/scale';
import { colors } from '../../styles/common';
import { FormInput } from 'react-native-elements'

@observer
export default class TextControl extends Component<any, any> {

    static propTypes =
        {
            value: PropTypes.string.isRequired,
            maxLength: PropTypes.number,
            onUpdate: PropTypes.func.isRequired,
            placeholder: PropTypes.string,
            disabled: PropTypes.bool,
            direction: PropTypes.string
        };
    static defaultProps =
        {
            value: ''
        };
    @observable text: string;
    keyboardWillHideSub: EmitterSubscription;
    textInput;

    constructor(props)
    {
        super(props);
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

    handleChange(text)
    {
        this.text = text;
    }

    handleEndEditing=()=>
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
            <FormInput
                textInputRef={textInput => this.textInput = textInput}
                editable={!this.props.disabled}
                caretHidden={false}
                placeholder={this.props.placeholder}
                placeholderTextColor={colors.middleGray}
                autoCapitalize="none"
                autoCorrect={false}
                value={this.text}
                maxLength={this.props.maxLength}
                onChangeText={this.handleChange}
                onBlur={this.handleEndEditing}
                underlineColorAndroid={colors.middleGray}
                containerStyle={styles.inputContainer}
                inputStyle={[styles.input, { textAlign: this.props.direction, color: textColor }]}
            />
        )
    }
}

const styles = StyleSheet.create({
    inputContainer:
        {
            marginTop: -10,
            marginLeft: 0,
            marginRight: 0
        },
    input:
        {
            fontWeight: 'bold',
            minHeight: verticalScale(5),
            marginLeft: 0,
            marginRight: 0
        },
    errorMsgContainer:
        {
            position: 'absolute',
            top: 10
        }
});
