import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
} from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import { inject, observer } from 'mobx-react';
import { Strings } from '../modules/strings';
import { colors } from '../styles/common';

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
        return (<CheckBox {...this.btnProps} right={iconRight} iconRight={iconRight} containerStyle={styles.checkBox} />)
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
    checkBox:
        {
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0
        },
    disabled:
        {
            backgroundColor: 'transparent',
            opacity: 0.5
        }
});