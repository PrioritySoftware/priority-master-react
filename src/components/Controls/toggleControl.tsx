import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Switch } from 'react-native';
import { colors } from '../../styles/common';

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

    @observable selected: string;

    constructor(props)
    {
        super(props);
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
        let onTintColor = colors.middleBlue;
        let tintColor = colors.gray;
        let thumbTintColor = this.isSelected ? colors.primaryColor : 'white';
        if (this.props.disabled)
        {
            onTintColor = 'rgba(0, 173, 238, 0.2)';
            tintColor = 'rgba(226, 226, 226, 0.6)';
            thumbTintColor = this.isSelected ? colors.blueDisabled : 'rgba(255, 255, 255, 0.75)';
        }
        let alignItems = this.props.direction === 'right' ? 'flex-start' : 'flex-end';
        return (
            <View style={[styles.switchContainer, { alignItems: alignItems }]}>
                <Switch
                    value={this.isSelected}
                    onValueChange={newVal => { this.handleToggle(newVal) }}
                    disabled={this.props.disabled}
                    onTintColor={onTintColor}
                    tintColor={tintColor}
                    thumbTintColor={thumbTintColor}
                    style={styles.switch}
                />
            </View>
        );

    }
}

const styles = StyleSheet.create({
    switchContainer:
        {
            borderBottomWidth: 1,
            borderBottomColor: colors.middleGray,
            paddingBottom: 3,
            marginTop: -6,
            marginBottom: 8,
            marginHorizontal: 3,
        },
    switch: {
        flexDirection: 'row'
    }
})
