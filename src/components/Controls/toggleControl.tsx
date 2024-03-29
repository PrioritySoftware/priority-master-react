import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Switch, Platform } from 'react-native';
import { colors, alignItems, opacityOff, margin } from '../../styles/common';
import { Strings } from '../../modules/strings';

@inject("strings")
@observer
export default class ToggleControl extends Component<any, any>
{

    static propTypes =
        {
            value: PropTypes.string.isRequired,
            onUpdate: PropTypes.func.isRequired,
            disabled: PropTypes.bool,
            direction: PropTypes.string
        };
    static defaultProps =
        {
            direction: 'left',
            value: ''
        };

    strings: Strings;

    @observable selected: string;

    constructor(props)
    {
        super(props);

        this.strings = this.props.strings;

        this.selected = this.props.value;
        this.handleToggle = this.handleToggle.bind(this);
    }

    get isSelected(): boolean
    {
        return this.selected === 'Y';
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.selected !== nextProps.value)
        {
            this.selected = nextProps.value;
        }
    }

    handleToggle(toggleValue)
    {
        const { onUpdate } = this.props;
        if (toggleValue !== this.isSelected)
        {
            this.selected = toggleValue ? 'Y' : '';
            onUpdate(this.selected);
        }
    }

    render()
    {
        let onTintColor = colors.primaryColor; // background on
        let tintColor = colors.middleDarkGray; // background off
        let thumbTintColor = this.isSelected ? colors.toggleOn : 'white'; // circle
        if (this.strings.platform === 'ios')
        {
            thumbTintColor = null; // the circle is white with shadow
            tintColor=colors.disabledGray;// border color
        }
        let opacity = this.props.disabled ? opacityOff : 1;

        return (
            <View style={[styles.switchContainer, alignItems(this.strings.isRTL)]}>
                <Switch
                    value={this.isSelected}
                    onValueChange={newVal => { this.handleToggle(newVal) }}
                    disabled={this.props.disabled}
                    onTintColor={onTintColor}
                    tintColor={tintColor}
                    thumbTintColor={thumbTintColor}
                    style={[styles.switch, { opacity: opacity }]}
                />
            </View>
        );

    }
}

const styles = StyleSheet.create({
    switchContainer:
        {
            borderBottomWidth: 1,
            borderBottomColor: colors.gray,
            paddingBottom: 4,
            marginTop: 0,
            marginBottom: 8,
            ...Platform.select({
                ios:
                    {
                        paddingBottom: 6,
                    }
            })
        },
    switch: {
        flexDirection: 'row',
        marginHorizontal: -2
    }
})
