import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Keyboard, StyleSheet, EmitterSubscription, View } from 'react-native';
import { verticalScale, scale } from '../../utils/scale';
import { colors, iconNames } from '../../styles/common';
import { FormInput, Icon } from 'react-native-elements'
import { observable } from 'mobx';
import { Strings } from '../../modules/strings';

@inject("strings")
@observer
export default class TextControl extends Component<any, any> {

    static propTypes =
        {
            value: PropTypes.string.isRequired,
            maxLength: PropTypes.number,
            onUpdate: PropTypes.func.isRequired,
            placeholder: PropTypes.string,
            disabled: PropTypes.bool,
            direction: PropTypes.string,
            icon: PropTypes.string,
            iconClick: PropTypes.func
        };
    static defaultProps =
        {
            value: '',
            icon: ''
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

    handleChange = (text) =>
    {
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
        let inputPadding = this.strings.dirByLang === 'rtl' ? { paddingLeft: scale(25) } : { paddingRight: scale(25) };
        return (
            <View style={{ flexDirection: this.strings.flexDir }}>
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
                    underlineColorAndroid='transparent'
                    containerStyle={styles.inputContainer}
                    inputStyle={[styles.input, { textAlign: this.strings.sideByLang, color: textColor },inputPadding]}
                />
                {this.renderIcon()}
            </View>
        )
    }
    renderIcon()
    {
        let iconColor = this.props.disabled ? colors.gray : colors.darkGray;
        let padding = this.strings.sideByLang === 'right' ? { paddingRight: scale(20) } : { paddingLeft: scale(20) };
        let { icon, iconClick } = this.props;
        let isSmallIcon = icon === iconNames.search || icon === iconNames.attach;
        let iconMargin = isSmallIcon ? { marginHorizontal: scale(-38) } : { marginHorizontal: scale(-42) };
        if (icon !== '')
        {
            return (
                <Icon type='ionicon' name={icon}
                    size={23} color={iconColor} style={[styles.icon, padding, iconMargin]}
                    underlayColor='transparent'
                    onPress={() => iconClick()} />
            );
        }
        return (null);

    }
}

const styles = StyleSheet.create({
    inputContainer:
        {
            marginTop: verticalScale(-6),
            marginLeft: 0,
            marginRight: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.gray,
            width: '100%',
        },
    input:
        {
            fontWeight: 'bold',
            minHeight: verticalScale(5),
            marginLeft: 0,
            marginRight: 0,
            marginBottom: verticalScale(-5),
        },
    icon:
        {
            marginTop: verticalScale(12)
        }
});
