import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Platform } from 'react-native';
import { verticalScale, scale } from '../../utils/scale';
import { colors, iconNames, padding, flexDirection, textAlign, margin, opacityOff } from '../../styles/common';
import { FormInput, Icon } from 'react-native-elements'
import { observable } from 'mobx';
import { Strings } from '../../modules/strings';
import { ColumnZoomType } from '../../modules/columnZoomType.class';

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
            type: PropTypes.string,
            direction: PropTypes.string,
            icon: PropTypes.string,
            iconClick: PropTypes.func,
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
            icon: ''
        };

    strings: Strings;

    @observable text: string;

    constructor(props)
    {
        super(props);
        this.strings = this.props.strings;
        this.text = props.value;
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.text !== nextProps.value)
        {
            this.text = nextProps.value;
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
    isAttach()
    {
        return this.props && this.props.type && this.props.type === ColumnZoomType.Attach;
    }
    render()
    {
        let inputWidth = '100%';
        if (this.props.icon !== '')
            inputWidth = '95%';
        return (
            <View style={flexDirection(this.strings.isRTL)}>
                <FormInput
                    editable={!this.props.disabled}
                    placeholder={this.props.placeholder}
                    placeholderTextColor={colors.middleGray}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={this.text}
                    maxLength={this.props.maxLength}
                    onChangeText={this.handleChange}
                    onBlur={this.handleEndEditing}
                    underlineColorAndroid='transparent'
                    containerStyle={[this.props.containerStyle, flexDirection(this.strings.isRTL)]}
                    inputStyle={[this.props.inputStyle, textAlign(this.strings.isRTL), { width: inputWidth }]}
                />
                {this.renderIcon()}
            </View>
        )
    }
    renderIcon()
    {
        let opacity = this.props.disabled ? opacityOff : 1;
        let { icon, iconClick } = this.props;
        let isSmallIcon = icon === iconNames.search || icon === iconNames.attach;
        let iconMargin = isSmallIcon ? { marginHorizontal: -38 } : { marginHorizontal: -42.5 };
        if (isSmallIcon && icon === iconNames.attach)
            iconMargin = { marginHorizontal: -35 };
        if (icon !== '')
        {
            return (
                <Icon type='ionicon'
                    name={icon}
                    size={23}
                    color={colors.darkGray}
                    style={
                        [
                            isSmallIcon && styles.icon,
                            !isSmallIcon && styles.largeIcon,
                            padding(this.strings.isRTL, 20),
                            iconMargin,
                            { opacity: opacity }
                        ]
                    }
                    underlayColor='transparent'
                    onPress={() => iconClick()} />
            );
        }
        return (null);
    }
}

const styles = StyleSheet.create({
    icon:
        {
            alignSelf: 'flex-end',
            paddingVertical: 7.2,
            marginTop: -7.2,
            ...Platform.select({
                ios:
                    {
                       
                        marginTop: -10,
                    }
            })
        },
    largeIcon:
        {
            alignSelf: 'flex-end',
            paddingVertical: 11.2,
            marginTop: -11.2,
            ...Platform.select({
                ios:
                    {
                        paddingVertical: 10,
                        marginTop: -20,
                    }
            })
        }
});
