import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    FlatList,
    Platform,
} from 'react-native';
import { colors } from "../styles/common";
import { scale } from '../utils/scale';

export class HorizontalList extends Component<any, any>
{

    static propTypes = {
        list: PropTypes.array.isRequired,
        selected: PropTypes.string.isRequired,
        onPress: PropTypes.func.isRequired,
        inverted: PropTypes.bool.isRequired,
    };

    onPress = (item) =>
    {
        this.props.onPress(item)
    }

    getstyle(item)
    {
        if (this.props.selected === item.name)
        {
            return styles.selectItem
        }
        return ""
    }

    render()
    {
        if (this.props.list.length >= 1)
        {
            return (
                <View style={styles.subFormListContainer}>
                    <FlatList contentContainerStyle={[styles.subFormList]}
                        horizontal={true}
                        data={this.props.list}
                        inverted={this.props.inverted}
                        renderItem={this.renderSubFormListItem}
                        keyExtractor={item => item.name}
                    />
                </View>
            )
        }
        else
        {
            return (null)
        }
    }
    renderSubFormListItem = ({ item }) => (
        <View style={styles.subFormItemBox} >
            <Text style={[styles.subFormItem, this.getstyle(item)]}
                onPress={() => { this.onPress(item) }}>
                {item.title}
            </Text>
        </View>
    )
}
/*********** style ************* */
const styles = StyleSheet.create({
    subFormListContainer:
        {
            flex: 0,
            backgroundColor: colors.menuBackground
        },
    subFormList:
        {
            flex: 0,
            flexDirection: 'row',
        },
    subFormItemBox: {
        flex: 0,
        lineHeight: 15, //IOS requires entering font size
        fontSize: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subFormItem: {
        padding: 5,
        margin: 10,
        marginTop: 3,
        lineHeight: 15,
        fontSize: 15,
        marginBottom: 5,
    },
    subFormItemText:
        {
            color: colors.darkGray
        },
    selectItem:
        {
            borderBottomColor: colors.darkGray,
            borderBottomWidth:0.5,
            ...Platform.select({
                ios:
                    {
                        borderBottomWidth:0,
                        textDecorationLine: 'underline'
                    }
            })
        },
});