import React, { Component,PropTypes } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    TouchableNativeFeedback,
    Platform
} from 'react-native';
import { colors } from "../styles/common";

export class Card extends Component<any, any>
{
    static propTypes =
    {
        title: PropTypes.string,
        onPress: PropTypes.func,
        content: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.arrayOf(PropTypes.element)
        ]),
        cardContainerStyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ]),
        cardStyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ]),
        cardTextStyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ])
    };

    render()
    {
        let Comp = Platform.OS === 'ios' ? TouchableHighlight : TouchableNativeFeedback;
        let background = Platform.OS === 'ios' ? {} : TouchableNativeFeedback.SelectableBackground();
        let title=this.props.title || '';
        let onPress= this.props.onPress || (() => { });
        let content = <Text style={[styles.cardText, this.props.cardTextStyle]}>{title}</Text>;
        return (
            <Comp background={background} onPress={onPress} underlayColor={colors.lightGray} activeOpacity={0.6} delayPressIn={100}>
                <View style={[styles.cardContainer, this.props.cardContainerStyle]}>
                    <View style={[styles.card, this.props.cardStyle]}>
                        {this.props.content ? this.props.content : content}
                    </View>
                </View>
            </Comp>
        );
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
    cardText:
    {
        textAlign: 'center',
        paddingVertical: 30,
    },
    cardContainer:
    {

    },
    card:
    {

    }
});