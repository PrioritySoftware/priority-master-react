import React, { Component } from 'react';
import
{
    StyleSheet,
    View,
    Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { header, center, margin, iconNames, headerHeight } from "../styles/common";
import providers from '../providers';
import { Strings } from '../modules/strings';
import { Header, Icon } from 'react-native-elements';

export class HeaderComp extends Component<any, any>
{
    static propTypes =
        {
            title: PropTypes.string,
            centerComp: PropTypes.object,
            optionsComp: PropTypes.object,
            goBack: PropTypes.func
        };
    static defaultProps =
        {
            optionsComp: {}
        };
    strings: Strings;
    constructor(props)
    {
        super(props);
        this.strings = providers.strings;
    }
    render()
    {
        let backIconName;
        let leftComp = this.props.optionsComp;
        let rightComp = this.props.optionsComp;

        // Renders back icon only when 'goBack' function is sent in props.
        // Else renders 'optionsComp' instead.
        if (this.strings.isRTL)
        {
            if (this.props.goBack)
                rightComp = this.renderBackIcon(iconNames.arrowForward);
            else
                leftComp = null;
        }
        else
        {
            if (this.props.goBack)
                leftComp = this.renderBackIcon(iconNames.arrowBack);
            else
                rightComp = null;
        }

        let centerComponent = this.props.title ? { text: this.props.title, style: styles.headerTitleStyle, ellipsizeMode: 'tail', numberOfLines: 1 } : this.props.centerComp;
        return (
            <View style={styles.headerContainer}>
                <Header
                    centerComponent={centerComponent}
                    rightComponent={rightComp}
                    leftComponent={leftComp}
                    outerContainerStyles={[header, { flexDirection: 'row-reverse' }]}
                    innerContainerStyles={[center, this.strings.platform === 'ios' ? { marginTop: 10 } : {}]}
                />
            </View>
        );
    }
    renderBackIcon(iconName: string)
    {
        return (<Icon
            type='ionicon'
            name={iconName}
            onPress={() => { this.props.goBack() }}
            color='white'
            underlayColor='transparent'
            size={22}
            containerStyle={[styles.backButton, margin(this.strings.isRTL, -20)]} />
        );
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
    headerTitleStyle:
        {
            alignSelf: 'center',
            color: 'white',
            fontSize: 19,
            maxWidth: '85%'
        },
    headerContainer:
        {
            height: headerHeight
        },
    backButton:
        {
            paddingVertical:30,
            paddingHorizontal: 20,
            ...Platform.select({
                ios:
                    {
                        paddingTop: 35
                    }
            })

        }
});