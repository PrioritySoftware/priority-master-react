import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
} from 'react-native';
import { Button } from 'react-native-elements';

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

    render()
    {
        if (this.props.type === 'checkbox')
            return this.renderCheckBox();
        return this.renderButton();
    }
    renderButton()
    {
        return (<Button {...this.props} />)
    }
    renderCheckBox()
    {
        return (null);
    }
}
/*********** style ************* */
const styles = StyleSheet.create({

});