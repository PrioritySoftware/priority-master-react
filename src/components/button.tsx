import React, { Component } from 'react';
import
{
    StyleSheet,
} from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import { inject, observer } from 'mobx-react';
import { Strings } from '../modules/strings';
import { colors, iconNames } from '../styles/common';
import PropTypes from 'prop-types';

@inject("strings")
@observer
export class ButtonComp extends Component<any, any>
{
    static propTypes =
        {
            type: PropTypes.string,
        };
    static defaultProps =
        {
            type: 'button'
        };

    strings: Strings;
    btnProps;

    constructor(props)
    {
        super(props);
        this.strings = props.strings;
        this.btnProps = props;
    }
    componentWillReceiveProps(newProps)
    {
        this.btnProps = newProps;
    }
    render()
    {
        if (this.btnProps.type === 'checkbox')
            return this.renderCheckBox();
        return this.renderButton();
    }
    renderButton()
    {
        return (<Button {...this.btnProps} disabledStyle={styles.disabled} />)
    }
    renderCheckBox()
    {
        let iconRight = this.strings.isRTL ? true : false;
        let isIOS = this.strings.platform === 'ios';
        let checkedIconName = isIOS ? iconNames.checkboxIOS : iconNames.checkBoxMD;
        let uncheckedIconName = isIOS ? iconNames.blankCheckboxIOS : iconNames.blankCheckboxMD;
        return (<CheckBox
            {...this.btnProps}
            iconType='material-community'
            checkedIcon={checkedIconName}
            uncheckedIcon={uncheckedIconName}
            center={isIOS}
            right={!isIOS && iconRight}
            iconRight={iconRight}
            containerStyle={styles.checkBox} />)
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
    checkBox:
        {
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            marginRight:0,
            marginLeft:0,
        },
    disabled:
        {
            backgroundColor: 'transparent',
            opacity: 0.5
        }
});