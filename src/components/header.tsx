import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
    View
} from 'react-native';
import { header, center } from "../styles/common";
import providers from '../providers';
import { Strings } from '../modules/strings';
import { Header, Icon } from 'react-native-elements';

export class HeaderComp extends Component<any, any>
{
    static propTypes =
        {
            title: PropTypes.string.isRequired,
            specialComponent: PropTypes.object,
            goBack: PropTypes.func.isRequired
        };
    static defaultProps =
        {
            specialComponent: {}
        };
    strings: Strings;
    constructor(props)
    {
        super(props);
        this.strings = providers.strings;
    }
    render()
    {
        let iconName;
        let leftComp = this.props.specialComponent;
        let rightComp = this.props.specialComponent;
        if (this.strings.dirByLang === 'rtl')
        {
            iconName = this.strings.platform === 'ios' ? 'ios-arrow-forward' : 'md-arrow-forward';
            rightComp = this.renderBackIcon(iconName);
        }
        else
        {
            iconName = this.strings.platform === 'ios' ? 'ios-arrow-back' : 'md-arrow-back';
            leftComp = this.renderBackIcon(iconName);
        }
        return (
            <View style={styles.headerContainer}>
                <Header
                    centerComponent={{ text: this.props.title, style: styles.headerTitleStyle, ellipsizeMode: 'tail', numberOfLines: 1 }}
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
        let padding = this.strings.dirByLang === 'rtl' ? { paddingLeft: 30 } : { paddingRight: 30 };
        let style = this.strings.platform === 'ios' ? { paddingTop: 5 } : {};
        return (<Icon
            type='ionicon'
            name={iconName}
            onPress={() => { this.props.goBack() }}
            color='white'
            underlayColor='transparent'
            size={22}
            containerStyle={[style, padding]} />
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
            maxWidth:'85%'
        },
    headerContainer:
        {
            flex: 0.12,
        },
});