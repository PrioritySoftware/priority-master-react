import React, { Component } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    TouchableNativeFeedback,
    Platform
} from 'react-native';

export class Card extends Component<any, any>
{
    render()
    {
        let Comp = Platform.OS === 'ios' ? TouchableHighlight : TouchableNativeFeedback;
        return (

            <Comp background={TouchableNativeFeedback.SelectableBackground()}  >
                <View style={[styles.cardContainer, this.props.cardContainerStyle]}>
                    <View style={[styles.card, this.props.cardStyle]}>
                        <Text style={[styles.cardText, this.props.cardTextStyle]}>{this.props.title}</Text>
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